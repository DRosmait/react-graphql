import React from 'react';
import axios from 'axios';
import './App.css';

const axionGitHupGraphQL = axios.create({
    baseURL: 'https://api.github.com/graphql',
    headers: {
        Authorization: `token ${
            process.env.REACT_APP_GITHUP_PERSONAL_ACCESS_TOKEN
        }`,
    },
});

const GET_ISSUES_OF_REPOSITORY = `
    {
        organization(login: "the-road-to-learn-react") {
            name
            url
            repository(name: "the-road-to-learn-react") {
                name
                url
                issues(last: 5) {
                    edges {
                        node {
                            id
                            title
                            url
                        }
                    }
                }
            }
        }
    }
`;

const TITLE = 'React GraphQL GitHub Client';

export default class App extends React.Component {
    state = {
        path: 'road-to-learn-react',
        organization: null,
        errors: null,
    }

    onSubmit = e => {
        e.preventDefault();
        this.onFetchFromGithub();
    }

    onChange = e => this.setState({ path: e.target.value })

    componentDidMount() {
        this.onFetchFromGithub();
    }

    onFetchFromGithub() {
        axionGitHupGraphQL
            .post('', { query: GET_ISSUES_OF_REPOSITORY })
            .then(result => this.setState({
                organization: result.data.data.organization,
                errors: result.data.data.errors,
            }))
            .catch(console.error);
    }

    render() {
        const { path, organization, errors } = this.state;

        return (
            <div>
                <h1>{TITLE}</h1>

                <form onSubmit={this.onSubmit}>
                    <label htmlFor="url">
                        Show open issues for https://github.com/
                    </label>
                    <input
                        id="url"
                        type="text"
                        value={path}
                        onChange={this.onChange}
                        style={{ width: '300px' }}
                    />
                    <button type="submit">Submit</button>
                </form>

                <hr/>

                <Organization organization={organization} errors={errors} />
            </div>
        )
    }
}

const Organization = ({ organization, errors }) => {
    if (errors) {
        return (
            <p>
                <strong>Something went wrong:</strong>
                { errors.map(err => err.message).join(' ') }
            </p>
        )
    }

    return organization ? (
        <div>
            <p>
                <strong>Issue from organization:</strong>
                <a href={organization.url} >{organization.name}</a>
            </p>
            <Repository repository={organization.repository}/>
        </div>
    ) : (
        <p>No information yet...</p>
    );
};

const Repository = ({ repository }) => {
    return (
        <div>
            <p>
                <strong>In Repository</strong>
                <a href={repository.url}>{repository.name}</a>
            </p>‚

            <ul>
                {
                    repository.issues.edges.map(issue => (
                        <li key={issue.node.id}>
                            <a href={issue.node.url}>{issue.node.title}</a>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
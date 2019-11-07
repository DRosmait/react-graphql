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

const GET_ORGANIZATION = `
    {
        organization(login: "the-road-to-learn-react") {
            name
            url
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
            .post('', { query: GET_ORGANIZATION })
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

                <Organization organization={organization} />
            </div>
        )
    }
}

const Organization = ({ organization }) => {
    return organization ? (
        <div>
            <p>
                <strong>Issue from organization:</strong>
                <a href={organization.url} >{organization.name}</a>
            </p>
        </div>
    ) : null;
}
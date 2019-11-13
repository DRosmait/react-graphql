import React from 'react';
import axios from 'axios';
import './App.css';

const axiosGitHubGraphQL = axios.create({
    baseURL: 'https://api.github.com/graphql',
    headers: {
        Authorization: `token ${
            process.env.REACT_APP_GITHUP_PERSONAL_ACCESS_TOKEN
            }`,
    },
});

const GET_ISSUES_OF_REPOSITORY = `
  query (
      $organization: String!,
      $repository: String!,
      $cursor: String
    ) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        id
        name
        url
        stargazers {
          totalCount
        }
        viewerHasStarred
        issues(first: 5, after: $cursor, states: [OPEN]) {
          edges {
            node {
              id
              title
              url
              reactions(last: 3) {
                edges {
                  node {
                    id
                    content
                  }    
                }
              }
            }
          }
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

const ADD_STAR = `
  mutation ($repositoryId: ID!) {
    addStar(input: { starrableId: $repositoryId }) {
      starrable {
        viewerHasStarred
      }
    }
  }
`;

const REMOVE_STAR = `
  mutation ($repositoryId: ID!) {
    removeStar(input: { starrableId: $repositoryId }) {
      starrable {
        viewerHasStarred
      }
    }
  }
`;

const getIssuesOfRepository = (path, cursor) => {
    const [organization, repository] = path.split('/');

    return axiosGitHubGraphQL.post('', {
        query: GET_ISSUES_OF_REPOSITORY,
        variables: { organization, repository, cursor },
    });
};

const resolveIssuesQuery = (queryResult, cursor) => state => {
    const { data, errors } = queryResult.data;

    if (!cursor) {
        return {
            organization: data.organization,
            errors,
        };
    }

    const { edges: oldIssues } = state.organization.repository.issues;
    const { edges: newIssues } = data.organization.repository.issues;
    const updatedIssues = [...oldIssues, ...newIssues];

    return {
        organization: {
            ...data.organization,
            repository: {
                ...data.organization.repository,
                issues: {
                    ...data.organization.repository.issues,
                    edges: updatedIssues,
                }
            }
        },
        errors,
    }
};

const addStarToRepository = repositoryId => {
    return axiosGitHubGraphQL.post('', {
        query: ADD_STAR,
        variables: { repositoryId },
    });
};

const resolveAddStarMutation = mutationResult => state => {
    const { viewerHasStarred } = mutationResult.data.data.addStar.starrable;
    const { totalCount } = state.organization.repository.stargazers;

    return {
        ...state,
        organization: {
            ...state.organization,
            repository: {
                ...state.organization.repository,
                viewerHasStarred,
                stargazers: {
                    totalCount: totalCount + 1
                }
            },
        },
    };
};

const removeStartFromRepository = repositoryId => {
    return axiosGitHubGraphQL.post('', {
        query: REMOVE_STAR,
        variables: { repositoryId },
    });
};

const resolveRemoveStartMutation = mutationResult => state => {
    const { viewerHasStarred } = mutationResult.data.data.removeStar.starrable;
    const { totalCount } = state.organization.repository.stargazers;

    return {
        ...state,
        organization: {
            ...state.organization,
            repository: {
                ...state.organization.repository,
                viewerHasStarred,
                stargazers: {
                    totalCount: totalCount - 1,
                },
            },
        },
    };
};

export default class App extends React.Component {
    state = {
        path: 'the-road-to-learn-react/the-road-to-learn-react',
        organization: null,
        errors: null,
    }

    onSubmit = e => {
        e.preventDefault();
        this.onFetchFromGitHub(this.state.path);
    }

    onChange = e => this.setState({ path: e.target.value })

    componentDidMount() {
        this.onFetchFromGitHub(this.state.path);
    }

    onFetchFromGitHub = (path, cursor) => {
        getIssuesOfRepository(path, cursor).then(queryResult =>
            this.setState(resolveIssuesQuery(queryResult, cursor)),
        );
    }

    onFetchMoreIssues = () => {
        const {
            endCursor
        } = this.state.organization.repository.issues.pageInfo;

        this.onFetchFromGitHub(this.state.path, endCursor);
    }

    onStarRepository = (repositoryId, viewerHasStarred) => {
        if (viewerHasStarred) {
            removeStartFromRepository(repositoryId).then(mutationResult => 
                this.setState(resolveRemoveStartMutation(mutationResult))
            );
        } else {
            addStarToRepository(repositoryId).then(mutationResult =>
                this.setState(resolveAddStarMutation(mutationResult)),
            );
        }
    }

    render() {
        const { organization, errors } = this.state;

        return (
            <div>
                <hr />

                {organization ? (
                    <Organization
                        organization={organization}
                        errors={errors}
                        onFetchMoreIssues={this.onFetchMoreIssues}
                        onStarRepository={this.onStarRepository}
                    />
                ) : (
                        <p>No information yet ...</p>
                    )}
            </div>
        );
    }
}

const Organization = ({
    organization,
    errors,
    onFetchMoreIssues,
    onStarRepository,
}) => {
    if (errors) {
        return (
            <p>
                <strong>Something went wrong:</strong>
                {errors.map(error => error.message).join(' ')}
            </p>
        );
    }

    return (
        <div>
            <p>
                <strong>Issues from Organization:</strong>
                <a href={organization.url}>{organization.name}</a>
            </p>
            <Repository
                repository={organization.repository}
                onFetchMoreIssues={onFetchMoreIssues}
                onStarRepository={onStarRepository}
            />
        </div>
    );
};

const Repository = ({
    repository,
    onFetchMoreIssues,
    onStarRepository,
}) => (
        <div>
            <p>
                <strong>In Repository:</strong>
                <a href={repository.url}>{repository.name}</a>
            </p>

            <button type="button" onClick={() => onStarRepository(repository.id, repository.viewerHasStarred)}>
                {repository.stargazers.totalCount}
                {' '}
                {repository.viewerHasStarred ? 'Unstar' : 'Star'}
            </button>

            <ul>
                {repository.issues.edges.map(issue => (
                    <li key={issue.node.id}>
                        <a href={issue.node.url}>{issue.node.title}</a>
                        {issue.node.reactions.edges.length > 0
                            ? <ReactionsList reactions={issue.node.reactions.edges} />
                            : null
                        }
                    </li>
                ))}
            </ul>

            {repository.issues.pageInfo.hasNextPage &&
                (<button onClick={onFetchMoreIssues}>More</button>)
            }
        </div>
    );

const ReactionsList = ({ reactions }) => (
    <ul>
        {reactions.map(({ node }) => <ReactionsItem content={node.content} key={node.id} />)}
    </ul>
);

const ReactionsItem = ({ content }) => (
    <li>{content}</li>
);
import axiosGitHubGraphQL from '../graphQL/axiosGitHubGraphQL';

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

export const getIssuesOfRepository = (path, cursor) => {
    const [organization, repository] = path.split('/');

    return axiosGitHubGraphQL.post('', {
        query: GET_ISSUES_OF_REPOSITORY,
        variables: { organization, repository, cursor },
    });
};

export const resolveIssuesQuery = (queryResult, cursor) => state => {
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
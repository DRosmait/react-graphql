import axiosGitHubGraphQL from '../graphQL/axiosGitHubGraphQL';

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

export const addStarToRepository = repositoryId => {
    return axiosGitHubGraphQL.post('', {
        query: ADD_STAR,
        variables: { repositoryId },
    });
};

export const resolveAddStarMutation = mutationResult => state => {
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

export const removeStartFromRepository = repositoryId => {
    return axiosGitHubGraphQL.post('', {
        query: REMOVE_STAR,
        variables: { repositoryId },
    });
};

export const resolveRemoveStartMutation = mutationResult => state => {
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
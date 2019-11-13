import axios from 'axios';

const axiosGitHubGraphQL = axios.create({
    baseURL: 'https://api.github.com/graphql',
    headers: {
        Authorization: `token ${
            process.env.REACT_APP_GITHUP_PERSONAL_ACCESS_TOKEN
            }`,
    },
});

export default axiosGitHubGraphQL;
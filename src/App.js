import React from 'react';
import './App.css';

import Organization from './components/Organization';
import { getIssuesOfRepository, resolveIssuesQuery } from './graphQL/issues';
import { removeStartFromRepository, resolveRemoveStartMutation, addStarToRepository, resolveAddStarMutation} from './graphQL/star';

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
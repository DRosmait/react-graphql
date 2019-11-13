import React from 'react';
import ReactionsList from './ReactionsList';

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

export default Repository;
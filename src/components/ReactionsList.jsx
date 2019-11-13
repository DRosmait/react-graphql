import React from 'react';

const ReactionsList = ({ reactions }) => (
    <ul>
        {reactions.map(({ node }) => <ReactionsItem content={node.content} key={node.id} />)}
    </ul>
);

const ReactionsItem = ({ content }) => (
    <li>{content}</li>
);

export default ReactionsList;
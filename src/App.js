import React from 'react';
import axios from 'axios';
import './App.css';

const axionGitHupGraphQL = axios.create({
    baseURL: 'https://api.github.com/graphql',
    headers: {
        Autorization: process.env.REACT_APP_GITHUP_PERSONAL_ACCESS_TOKEN,
    }
});

const TITLE = 'React GraphQL GitHub Client';

export default class App extends React.Component {
    state = {
        path: 'road-to-learn-react',
    }

    onSubmit = () => { /* fetch data */ }

    onChange = e => this.setState({ path: e.target.value })

    componentDidMount() {
        /* fetch data */
    }

    render() {
        const { path } = this.state;

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

                {/* Here comes the result! */}
            </div>
        )
    }
}

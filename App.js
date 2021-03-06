import React, { Component } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { ThemeProvider } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import { v4 as uuid } from 'uuid';

import Storage from './src/storage';
import { PAGES, LOCATIONS } from './src/constants';
import theme from './styles/theme';

import Landing from './screens/Landing';
import Home from './screens/Home';
import RecordSession from './screens/RecordSession';
import Settings from './screens/Settings';

class App extends Component {
    constructor(props) {
        super(props);
        // Remove all previous storage if opening in development
        if (__DEV__) Storage.local.remove(Object.values(LOCATIONS));
        this.state = {
            currentPage: PAGES.HOME,
            hasVisited: false
        };
    }

    async componentDidMount() {
        Storage.local.read(LOCATIONS.HASVISITED)
            .then(hasVisited => {
                this.setHasVisited(hasVisited || false);
            });
        let uniqueID = await Storage.secure.read(LOCATIONS.UNIQUEID) || await Storage.local.read(LOCATIONS.UNIQUEID);
        if (!uniqueID) {
            uniqueID = uuid();
            Storage.secure.isAvailable()
                .then(available => {
                    if (available) Storage.secure.write(LOCATIONS.UNIQUEID, uniqueID);
                    else Storage.local.write(LOCATIONS.UNIQUEID, uniqueID);
                });
        }
        console.log(uniqueID);
        this.setState({ uniqueID });
    }

    setHasVisited = (hasVisited) => this.setState({ hasVisited });

    closeLanding = () => {
        Storage.local.write(LOCATIONS.HASVISITED, true);
        this.setHasVisited(true);
    }

    getCurrentPage = () => {
        switch (this.state.currentPage) {
            case PAGES.HOME: return <Home setPage={this.setPage} />;
            case PAGES.RECORDSESSION: return <RecordSession setPage={this.setPage} />;
            case PAGES.SETTINGS: return <Settings setPage={this.setPage} />;
        }
    }

    setPage = {
        home: () => this.setState({ currentPage: PAGES.HOME }),
        recordSession: () => this.setState({ currentPage: PAGES.RECORDSESSION }),
        settings: () => this.setState({ currentPage: PAGES.SETTINGS })
    }

    // colorScheme = useColorScheme();

    render() {
        return (
            <ThemeWrapper>
                <SafeAreaView style={styles.container}>
                    <StatusBar style="auto" />
                    {this.state.hasVisited ? this.getCurrentPage() : (<Landing onClose={this.closeLanding} />)}
                </SafeAreaView>
            </ThemeWrapper>
        );
    }
}

const containerColor = '#fff';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: containerColor,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

function ThemeWrapper(props) {
    return (
        <ThemeProvider theme={theme}>
            {props.children}
        </ThemeProvider>
    );
}

export default App;
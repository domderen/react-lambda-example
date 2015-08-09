/**
 * This is main application component, the one that will always be rendered as wrapper around RouteHandler.
 */
import 'babel/polyfill';
import React from 'react';
import { RouteHandler } from 'react-router';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

class App extends React.Component {
  static propTypes = {
    routeName: React.PropTypes.string.isRequired,
    pathname: React.PropTypes.string.isRequired,
  }

  static childContextTypes = {
    routeName: React.PropTypes.string.isRequired,
    pathname: React.PropTypes.string.isRequired,
  }

  getChildContext() {
    const { routeName, pathname } = this.props;

    return {
      routeName,
      pathname,
    };
  }

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col xs={12}>
            <RouteHandler {...this.props} />
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;

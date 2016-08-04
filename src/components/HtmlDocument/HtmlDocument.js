import React from 'react';

class HtmlDocument extends React.Component {
  // Components properties with types and requirement.
  static propTypes = {
    routeName: React.PropTypes.string.isRequired,
    router: React.PropTypes.func.isRequired,
    pathname: React.PropTypes.string.isRequired,
    dataRender: React.PropTypes.object.isRequired,
    markup: React.PropTypes.string.isRequired,
    script: React.PropTypes.arrayOf(React.PropTypes.string),
    css: React.PropTypes.arrayOf(React.PropTypes.string),
  }

  // Properties that are passed to all child components.
  static childContextTypes = {
    routeName: React.PropTypes.string.isRequired,
    router: React.PropTypes.func.isRequired,
    pathname: React.PropTypes.string.isRequired,
  };

  // Default properties.
  static defaultProps = {
    script: [],
    css: [],
  }

  // Values of properties that will be passed to all child components.
  getChildContext() {
    const { routeName, router, pathname } = this.props;

    return {
      routeName,
      router,
      pathname,
    };
  }

  render() {
    const { markup, script, css } = this.props;

    return (
      <html className="no-js" lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width" />

          { /* Page title. */ }
          <title>Lemod</title>

          { /* Listing all css files from webpack. */ }
          { css.map((href, k) => <link key={k} rel="stylesheet" href={href} />) }
        </head>

        <body>
          { /* Adds markup for a given route element. */ }
          <div id="root" dangerouslySetInnerHTML={{ __html: markup }} />

          { /* Sets application state into a global variable. */ }
          <script dangerouslySetInnerHTML={{ __html: 'window.app=' + JSON.stringify(this.props.dataRender) + ';' }} />

          { /* Adds all scripts from webpack. */ }
          { script.map((src, k) => <script key={k} src={src} />) }
        </body>
      </html>
    );
  }
}

export default HtmlDocument;

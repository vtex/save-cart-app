import Helmet from 'react-helmet'
import React, {Component} from 'react'

// eslint-disable-next-line
class Typekit extends Component {
  render () {
    return (
      <Helmet
        script={[
          {
            id: 'typekit',
            src: 'https://use.typekit.net/fcw8bwb.js',
          },
          {
            type: 'text/javascript',
            innerHTML: 'document.getElementById(\'typekit\').onload=function(){try{Typekit.load({async:true})}catch(e){console.log(\'e\',e)}}',
          },
        ]}
        link={[
          {href: 'https://fonts.googleapis.com/css?family=Open+Sans:400,600'},
          {rel: 'stylesheet'},
        ]}
      />
    )
  }
}

export default Typekit

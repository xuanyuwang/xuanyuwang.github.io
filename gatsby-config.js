module.exports = {
  pathPrefix: "/",
  siteMetadata: {
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/data/homePageData`,
        name: 'HomePageData'
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/data/labData`,
        name: 'LabData'
      }
    }
  ],
}

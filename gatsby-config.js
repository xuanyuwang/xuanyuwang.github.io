module.exports = {
	pathPrefix: "/",
	siteMetadata: {
	},
	plugins: [
		'gatsby-plugin-react-helmet',
		'gatsby-plugin-sass',
		{
			resolve: 'gatsby-source-prismic',
			options: {
				repositoryName: 'xuanyuwang',
				accessToken: 'MC5YN0hsZ1JJQUFDQUFkcENM.77-977-977-9WV0t77-9QO-_vR9PDQJkSG4L77-9cwnvv73vv70Q77-977-9NTzvv73vv73vv71OeQ',
				schemas: {
					lab: require('./schemas/lab.json')
				}
			}
		}
	],
}

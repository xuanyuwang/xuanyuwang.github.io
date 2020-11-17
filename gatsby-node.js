const { graphql } = require('gatsby');
const path = require('path');

exports.createPages = async ({ graphql, actions }) => {
	const { createPage } = actions;
	const result = await graphql(`
	query {
	  allPrismicLab {
		edges {
		  node {
			data {
			  name
			  date(formatString: "YYYY MMM DD")
			  path
			  tags {
				tag {
				  raw
				}
			  }
			}
		  }
		}
	  }
	}`);
	const labs = result.data.allPrismicLab.edges;
	labs.forEach(({ node }) => {
		const pageContext = {};
		Object.assign(pageContext, node.data);
		delete pageContext.path;

		createPage({
			path: `labs/${node.data.path}`,
			component: path.resolve('./src/components/LabPage/LabTemplate.js'),
			context: pageContext
		});
	})
};
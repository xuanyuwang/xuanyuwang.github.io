import React from 'react';
import Container from '@material-ui/core/Container';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import PageHelmet from '../PageHelmet/PageHelmet';
import { useStaticQuery } from 'gatsby';

const LabsHomePage = () => {
	const data = useStaticQuery(graphql`
    {
      allPrismicLab {
        edges {
          node {
            data {
			  name
			  path
              date(formatString: "YYYY MMM DD")
            }
          }
        }
      }
	}`);
	const labs = data.allPrismicLab.edges.map((edge) => edge.node.data);
	return <Container>
		<PageHelmet/>
		<GridList>
			{labs.map((lab) => {
				return <GridListTile>
						<Card >
							<CardContent>
								<Typography>
									<Link href={`${lab.path}`}>
										{lab.name}
									</Link>
								</Typography>
							</CardContent>
						</Card>;
				</GridListTile>;
			})}
		</GridList>
	</Container>
};

export default LabsHomePage;
import { Box, Divider, Grid } from '@mui/material'
import React, { useContext } from 'react'
import MainHeading from '../../components/MainHeading'
import { GlobalContext } from '../../context/globalContext'
import { useFetchTask } from '../../services/task-service/useFetchTask'
import { useFetchFundings } from '../../services/funding-service/useGetFundings'
import Grant from './Grant'
import Loader from '../../components/Loader'

const Index = () => {
    const { verticalId } = useContext(GlobalContext)
    const { data, isFetched } = useFetchTask(verticalId)
    const { data: fundings, isFetched: isFundingFetched } = useFetchFundings(verticalId)


    if (!isFetched || !isFundingFetched) return <Loader />

    return (
        <Box>
            <Box>
                <MainHeading title={'Fundings'} />
            </Box>
                <Divider sx={{my:3}}/>
            <Box mt={4}>
                <div>
                    <Grid container spacing={4}>
                        {
                            data?.query && !!fundings[data?.query] && fundings[data?.query].map((grant) => (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Grant key={grant._id} grantDetails={grant} />
                                </Grid>
                            ))

                        }
                    </Grid>

                    {
                        Object.entries(fundings).map(([search_term, grants]) =>
                            search_term !== data?.query &&
                            <Box mt={4}>
                                <Divider />
                                <h2 style={{ fontSize: '1.25em', }}><i>{search_term}</i></h2>
                                <Grid container spacing={4}>
                                    {grants.map((grant) => (
                                        <Grid item xs={12} sm={6} md={4}>
                                            <Grant key={grant._id} grantDetails={grant} />
                                        </Grid>

                                    ))}
                                </Grid>

                            </Box>
                        )
                    }

                </div>
            </Box>
        </Box>
    )
}

export default Index
import { Box, Stack, styled } from "@mui/material";
import { FaClipboardCheck } from "react-icons/fa";
import { Card } from "../../components/Card";
import { TextClipper } from "../../components/TextClipper";

const Span = styled('span')(({ theme }) => ({
    color: 'black',
    fontWeight: 600,
    display: 'block'
}));


const Grant = ({ grantDetails }) => {
    function formatDate(dateStr) {
        if (dateStr.length !== 8)
            return dateStr; // or handle error as you prefer

        const month = dateStr.substring(0, 2);
        const day = dateStr.substring(2, 4);
        const year = dateStr.substring(4);

        return `${year}-${month}-${day}`;
    }

    return (
        <Card title={grantDetails.metadata.OpportunityTitle} href={`/grant/${grantDetails.id}`}>
            <Box>
                {
                    grantDetails?.metadata?.AgencyName && (
                        <TextClipper lineClamp={2}>
                            <Span>Agency</Span>
                            <span>{grantDetails.metadata.AgencyName}</span>
                        </TextClipper>
                    )

                }

                {
                    grantDetails.metadata.AwardFloor && grantDetails.metadata.AwardCeiling &&
                    <TextClipper  lineClamp={2}>
                        <Span>Awards</Span>
                        $ {grantDetails.metadata.AwardFloor} - $ {grantDetails.metadata.AwardCeiling}
                    </TextClipper>
                }
                {
                    <TextClipper  lineClamp={2}>
                        <Span>Award Floor</Span>
                        $ {grantDetails.metadata.AwardFloor || '-'}
                    </TextClipper>
                }
                {
                    <TextClipper  lineClamp={2}>
                        <Span>Award Ceiling</Span>

                        $ {grantDetails.metadata.AwardCeiling || '-'}
                    </TextClipper>
                }

                {
                    grantDetails?.metadata?.CloseDate &&
                    <TextClipper  lineClamp={2}>
                        <Span>Deadline</Span>
                        {formatDate(grantDetails.metadata.CloseDate)}
                    </TextClipper>

                }

                {
                    grantDetails?.metadata?.GrantorContactEmail &&
                    <TextClipper  lineClamp={2}>
                        <Span>Grantor Email</Span>
                        {grantDetails.metadata.GrantorContactEmail}
                    </TextClipper>
                }

                <TextClipper lineClamp={4}>
                    <Span>Description</Span>
                    {grantDetails.metadata.Description}
                </TextClipper>

                <Stack gap={2} direction={'row'} mt={4} alignItems={'center'}>
                    <FaClipboardCheck color='green'  />
                    {
                        grantDetails.metadata.OpportunityID ?
                            <a href={'https://grants.gov/search-results-detail/' + grantDetails.metadata.OpportunityID} target="_blank" rel="noreferrer">Apply</a>
                            :
                            <a href={grantDetails.metadata.grant_source_url} target="_blank" rel="noreferrer">Apply</a>
                    }
                </Stack>

            </Box>
        </Card>
       
    )
}

export default Grant

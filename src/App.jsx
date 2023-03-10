import { useEffect, useState } from "react";

import { Box, Typography } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';



const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false) // initialize the webtab
  const [targetDeals, setTargetDeals] = useState([]) // keeps the deals
  const [pageSize, setPageSize] = useState(10) // datagrid table pagesize
  const [currentUser, setCurrentUser] = useState("") // owner of the deals


  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) { // initialize the app
      setInitialized(true)
    });

    ZOHO.embeddedApp.init();
  }, [])

  useEffect(() => {
    const fetchData = async () => { // async fetch to collect the target deals
      if(initialized){
        
        const userResp = await ZOHO.CRM.CONFIG.getCurrentUser() // get the current logged in user
        const current_user = userResp?.users?.[0]?.id;
        setCurrentUser(userResp?.users?.[0]?.full_name)
  
        const conn_name = "zoho_crm_conn";
        let req_data = {
          parameters: {
            select_query:
              `select id, Amount, Deal_Name, Last_Follow_Up_Date, Days_From_Now from Deals where (Owner = '${current_user}' and Stage not in ('Deal Completed', 'Deal Lost' , 'Lost Request'))`,
          },
          method: "POST",
          url: "https://www.zohoapis.com/crm/v4/coql",
          param_type: 2,
        }
  
        const dealsResp = await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data) // target deals collected
        console.log(dealsResp?.details?.statusMessage?.data)
        let sortedDeals = dealsResp?.details?.statusMessage?.data?.sort((deal1, deal2) => (deal1.Amount < deal2.Amount) ? 1 : (deal1.Amount > deal2.Amount) ? -1 : 0) // sorts the row in dsc order based on amount
        let finalDealsArray = sortedDeals.map((deal, index) => { // adds a custom property to the deals to show the rank of each deal
          return {
            ...deal,
            "rank": index + 1
          }
        })
        setTargetDeals(finalDealsArray)
      }
    }
    fetchData();
  }, [initialized])

  const formatter = new Intl.NumberFormat('en-US', { // js formatter for currency
    style: 'currency',
    currency: 'USD',
  });


  const columns = [
    { 
      field: 'rank', 
      headerName: 'Rank', 
      flex: 1
    },
    {
      field: 'Deal_Name',
      headerName: 'Deal name',
      renderCell: (params) => (
        <Box>
            <a 
              href={`https://crm.zoho.com/crm/org651752009/tab/Potentials/${params.row.id}`} // adds the deal id from the current row data to the custom link
              style={{ 
                color: "#1976d2",
                textDecoration: "none"
              }}
              target="_blank"
              rel="noreferrer"
              >
                {params.value}
            </a>
        </Box>
      ),
      flex: 3
    },
    {
      field: 'Amount',
      headerName: 'Amount',
      renderCell: (params) => (
        <Box>
            <Typography sx={{ fontSize: "small" }}>
                {formatter.format(params.value)}
            </Typography>
        </Box>
      ),
      flex: 1.5
    },
    {
      field: 'Last_Follow_Up_Date',
      headerName: 'Last Contact Date',
      flex: 2.5
    },
    {
      field: 'Days_From_Now',
      headerName: 'Age',
      renderCell: (params) => (
        <Box>
            <Typography sx={{ color: `${params.value > 45 ? "red" : "#28cf9b"}`, fontWeight: `${params.value > 45 ? "bold" : ""}` }}>
                {params.value}
            </Typography>
        </Box>
      ),
      flex: 2
    }
  ];

  return (
    <Box
      sx={{
        width: "100%",
        p: "2rem 3rem"
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Deals for {currentUser}</h2>
      <Box
        sx={{
          width: "100%",
          height: `calc(111px + ${pageSize * 40}px)` // changes the height according to the number of rows, default row height is 52px in MUI datagrid
        }}
      >
        <DataGrid
          rows={targetDeals}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10]}
          disableSelectionOnClick
          rowHeight={40}
        />
      </Box>
    </Box>
  );
}

export default App;

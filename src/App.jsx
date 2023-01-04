import { useEffect, useState } from "react";
import { Box } from "@mui/material";

const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      setInitialized(true)
    });

    ZOHO.embeddedApp.init();
  }, [])

  useEffect(() => {
    if(initialized){
      let current_user = "";
      ZOHO.CRM.CONFIG.getCurrentUser().then(function(data){
        current_user = data?.users?.[0]?.full_name
        console.log(data?.users?.[0]?.full_name)
      });

      const conn_name = "zoho_crm_conn";
      let req_data = {
        parameters: {
          select_query:
            `select id, Amount, Deal_Name, Last_Follow_Up_Date, Days_From_Now from Deals where (Owner = ${current_user} and Stage not in ('Deal Completed', 'Deal Lost' , 'Lost Request'))`,
        },
        method: "POST",
        url: "https://www.zohoapis.com/crm/v3/coql",
        param_type: 2,
      }

      ZOHO.CRM.CONNECTION.invoke(conn_name, req_data).then(function (data) {
        console.log(data)
      })
    }
  }, [initialized])

  return (
    <Box
      sx={{
        width: "100%",
        p: "1.5rem 1rem"
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: 500
        }}
      >
        <h1>Hi</h1>
      </Box>
    </Box>
  );
}

export default App;

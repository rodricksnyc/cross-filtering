
import React, { useCallback, useEffect } from "react";
import styled from "styled-components";
import { LookerEmbedSDK } from "@looker/embed-sdk";
import { Space, SpaceVertical } from "@looker/components";
import { PageTitle } from "../common/PageTitle";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { sdk } from "../../helpers/CorsSessionHelper";
import {
  Filter,
  i18nResources,
  ComponentsProvider,
  useSuggestable,
  useExpressionState,
} from "@looker/filter-components";

const EmbedDashboardWFilters = () => {
  const [loading, setLoading] = React.useState(true);
  const [dashboard, setDashboard] = React.useState();

  // State for all the available filters for the embedded dashboard
  const [dashboardFilters, setDashboardFilters] = React.useState();

  // State for the filter values, selected by the filter components located outside the embedded dashboard
  const [filterValues, setFilterValues] = React.useState({});

  // Looker API call using the API SDK to get all the available filters for the embedded dashboard
  useEffect(() => {
    const initialize = async () => {
      const filters = await sdk.ok(
        sdk.dashboard(
          "data_block_acs_bigquery::acs_census_overview",
          "dashboard_filters"
        )
      );
      setDashboardFilters(filters["dashboard_filters"]);
    };
    initialize();
  }, []);

  // Set the new selected filter values in state, when selected using the components outside the dashboard
  const handleFilterChange = (newFilterValue, filterName) => {
    // Using the dashboard state, we are sending a message to the iframe to update the filters with the new values
    dashboard.send("dashboard:filters:update", {
      filters: {
        [filterName]: newFilterValue,
      },
    });
    // The "dashboard:run" message has to be sent for the filter change to take effect
    dashboard.send("dashboard:run");
  };

  // Set the state of the dashboard so we can update filters and run
  const handleDashboardLoaded = (dashboard) => {
    setDashboard(dashboard);
    setLoading(false);
  };

  /*
   Step 1 Initialization of the EmbedSDK happens when the user first access the application
   See App.js for reference
  */

  const makeDashboard = useCallback((el) => {
    if (!el) {
      return;
    }
    el.innerHTML = "";
    /*
      Step 2 Create your dashboard (or other piece of embedded content) through a simple set of chained methods
    */
    LookerEmbedSDK.createDashboardWithId(
      "data_block_acs_bigquery::acs_census_overview"
    )
      // Adds the iframe to the DOM as a child of a specific element
      .appendTo(el)
      // Hides the filters in the embedded dashboard. Custom themes must be enabled on the Looker instance.
      //.withParams({_theme: "{\"show_filters_bar\":false}"})
      // Performs the call to the auth service to get the iframe's src='' url, places it in the iframe and the client performs the request to Looker
      .build()
      // Establishes event communication between the iframe and parent page
      .connect()
      .then(handleDashboardLoaded)
      // Catches various errors which can occur in the process (note: does not catch 404 on content)
      .catch((error) => {
        console.error("An unexpected error occurred", error);
      });
  }, []);


  const makeDashboard2 = useCallback((el) => {
    if (!el) {
      return;
    }
    el.innerHTML = "";
    /*
      Step 2b Create your dashboard (or other piece of embedded content) through a simple set of chained methods
    */
    LookerEmbedSDK.createDashboardWithId(921)
      // adds the iframe to the DOM as a child of a specific element
      .appendTo(el)
      // this instructs the SDK to point to the /dashboards-next/ version
      .withNext()

        //.withParams({_theme: "{\"show_filters_bar\":false}"})
      // this line performs the call to the auth service to get the iframe's src='' url, places it in the iframe and the client performs the request to Looker
      .build()
      // this establishes event communication between the iframe and parent page
      .connect()
      // catch various errors which can occur in the process (note: does not catch 404 on content)
      .catch((error) => {
        console.error("An unexpected error occurred", error);
      });
  }, []);

  return (

      <div className={"embed-dashboard-main"} style={{padding:"20px"}}>
        <PageTitle text={"Two Dashboards with Filters"}
        style={{marginBottom:"50px"}} />
        <LoadingSpinner loading={loading} />
        <ComponentsProvider resources={i18nResources}>
          <Space m="u3" align="end" width="auto">
            {dashboardFilters?.map((filter) => {
              return (
                <DashFilters
                  filter={filter}
                  expression={filterValues[filter.name]}
                  onChange={(event) => handleFilterChange(event, filter.name)}
                  key={filter.id}
                />
              );
            })}
          </Space>
        </ComponentsProvider>
        {/* Step 0) we have a simple container, which performs a callback to our makeDashboard function */}
        <br/>


        <p>Dashboard 1</p>
        <Dashboard ref={makeDashboard}></Dashboard>
        <br/>

        <br/>

        <br/>

        <br/>

        <p>Dashboard 2</p>
        <Dashboard2 ref={makeDashboard2}></Dashboard2>

      </div>

  );
};

// A little bit of style here for heights and widths.
const Dashboard = styled.div`
  width: 100%;
  height: 40vh;
  bargin-bottom:200px;
  border:1px solid purple;
  & > iframe {
    width: 100%;
    height: 100%;
  }
`;

const Dashboard2 = styled.div`
width: 100%;
height: 40vh;
  border:1px solid purple;
  & > iframe {
    width: 100%;
    height: 100%;
  }
`;
export default EmbedDashboardWFilters;

// Utilizes the more custom implementation of Looker filter components described in the filter components documentation.
// Refer to the Looker filter components documentation for more details:
// https://github.com/looker-open-source/components/blob/HEAD/packages/filter-components/USAGE.md
export const DashFilters = ({ filter, expression, onChange }) => {
  const stateProps = useExpressionState({
    filter,
    // These props will likely come from higher up in your application
    expression,
    onChange,
  });

  const { suggestableProps } = useSuggestable({
    filter,
    sdk,
  });

  const FilterLabel = styled.span`
    font-family: inherit;
    margin: 0px;
    padding: 0px;
    color: rgb(64, 70, 75);
    font-size: 0.75rem;
    font-weight: 500;
    padding-bottom: 0.25rem;
  `;

  return (
<>
      <FilterLabel>{filter.name}</FilterLabel>
      <Filter
        name={filter.name}
        type={filter.type}
        config={{ type: "dropdown_menu" }}
        {...suggestableProps}
        {...stateProps}
      />
</>
  );
};

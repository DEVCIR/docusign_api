import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import { DocsComponents, DocsExample } from 'src/components';
import { apiUrl } from '../../..//components/Config/Config';

const List = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('1'); // Example user_id, replace with dynamic value

  useEffect(() => {
    // Send POST request with user_id and other data
    const data = {
        user_id: userId,
      };
  
      axios
        .post(`${apiUrl}/api/agent/property/`, data) // replace with your POST API endpoint
        .then((response) => {
            setTableData(response.data.data); // Update state with the fetched data
            setLoading(false); // Set loading to false after data is fetched
        })
        .catch((error) => {
          console.error('Error sending data:', error);
          setLoading(false);
        });
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>React Table</strong> <small>Vertical alignment</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              Table cells of <code>&lt;CTableHead&gt;</code> are always vertically aligned to the
              bottom. Table cells in <code>&lt;CTableBody&gt;</code> inherit their alignment from{' '}
              <code>&lt;CTable&gt;</code> and are aligned to the top by default. Use the align
              property to re-align where needed.
            </p>
            <DocsExample href="#">
              <CTable align="middle" responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col" className="w-20">
                      Title
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="w-20">
                      Address
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="w-20">
                      Price
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="w-20">
                      Bedroom/Bathroom
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="w-20">
                      Action
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tableData.length > 0 ? (
                    tableData.map((row, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{row.title}</CTableDataCell>
                        <CTableDataCell>{row.address}</CTableDataCell>
                        <CTableDataCell>{row.price}</CTableDataCell>
                        <CTableDataCell>{row.bedroom} / {row.bathroom}</CTableDataCell>
                        <CTableDataCell>
                          {/* You can add actions here, like Edit/Delete */}
                          <button>Edit</button>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center">
                        No data available
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default List;
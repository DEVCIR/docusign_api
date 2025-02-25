// import React, { useState, useEffect } from 'react';
// import {
//   CTable,
//   CTableBody,
//   CTableHead,
//   CTableHeaderCell,
//   CTableRow,
//   CTableDataCell,
//   CContainer,
//   CSpinner,
//   CButton,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter
// } from '@coreui/react';
// import { apiUrl } from "../../../components/Config/Config";
// import axios from 'axios';

// const Submit = () => {
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [viewModalVisible, setViewModalVisible] = useState(false);
//   const [currentSubmission, setCurrentSubmission] = useState(null);

//   useEffect(() => {
//     fetchSubmissions();
//   }, []);

//   const fetchSubmissions = async () => {
//     try {
//       const response = await axios.get(`${apiUrl}/api/submissions`);
//       setSubmissions(response.data.submissions);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching submissions:', error);
//       setLoading(false);
//     }
//   };

//   const handleViewSubmission = async (submission) => {
//     try {
//       // Fetch specific submission data using the documentId
//       const response = await axios.get(`${apiUrl}/api/submissions/${submission.document_id}`);

//       // Set the fetched document and submission data to display in the modal
//       const documentData = response.data[0];
//       const submissionDetails = documentData.document_submissions[0]; // Assuming the first submission is the one to show

//       setCurrentSubmission({
//         ...submission,
//         documentData: documentData,
//         submissionDetails: submissionDetails
//       });

//       setViewModalVisible(true);
//     } catch (error) {
//       console.error('Error fetching submission details:', error);
//     }
//   };

//   const handleCloseModal = () => {
//     setViewModalVisible(false);
//     setCurrentSubmission(null); // Reset the submission data
//   };

//   return (
//     <CContainer>
//       <h1>Submission Submit</h1>
//       {loading ? (
//         <CSpinner color="primary" />
//       ) : (
//         <>
//           <CTable hover responsive>
//             <CTableHead>
//               <CTableRow>
//                 <CTableHeaderCell scope="col">#</CTableHeaderCell>
//                 <CTableHeaderCell scope="col">Name</CTableHeaderCell>
//                 <CTableHeaderCell scope="col">File</CTableHeaderCell>
//                 <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
//               </CTableRow>
//             </CTableHead>
//             <CTableBody>
//               {submissions.map((submission, index) => (
//                 <CTableRow key={submission.id}>
//                   <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
//                   <CTableDataCell>{submission.document.name}</CTableDataCell>
//                   <CTableDataCell>
//                     <a href={apiUrl + "/public/storage/" + submission.file} target="_blank" rel="noopener noreferrer">Download</a>
//                   </CTableDataCell>
//                   <CTableDataCell>
//                     <CButton
//                       color="info"
//                       size="sm"
//                       onClick={() => handleViewSubmission(submission)}
//                       className="me-2"
//                     >
//                       View
//                     </CButton>
//                   </CTableDataCell>
//                 </CTableRow>
//               ))}
//             </CTableBody>
//           </CTable>

//           {/* View Modal */}
//           <CModal visible={viewModalVisible} onClose={handleCloseModal}>
//             <CModalHeader>
//               <CModalTitle>View Submission</CModalTitle>
//             </CModalHeader>
//             <CModalBody>
//               {currentSubmission ? (
//                 <>
//                   <p><strong>Document Title:</strong> {currentSubmission.documentData.name}</p>
//                   <p><strong>Description:</strong> {currentSubmission.documentData.description || 'N/A'}</p>
//                   <p><strong>Author:</strong> {currentSubmission.documentData.author || 'N/A'}</p>
//                   <p><strong>Status:</strong> {currentSubmission.submissionDetails.status}</p>
//                   <p><strong>Signature:</strong>
//                     <img
//                       src={currentSubmission.submissionDetails.data.signature}
//                       alt="Signature"
//                       style={{ width: '200px', height: 'auto' }}
//                     />
//                   </p>
//                   <p><strong>File:</strong>
//                     <a href={apiUrl + "/public/storage/" + currentSubmission.documentData.path} target="_blank" rel="noopener noreferrer">
//                       Download PDF
//                     </a>
//                   </p>
//                 </>
//               ) : (
//                 <p>No submission data available.</p>
//               )}
//             </CModalBody>
//             <CModalFooter>
//               <CButton color="secondary" onClick={handleCloseModal}>
//                 Close
//               </CButton>
//             </CModalFooter>
//           </CModal>
//         </>
//       )}
//     </CContainer>
//   );
// };

// export default Submit;

import React, { useState, useEffect } from 'react'
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CContainer,
  CSpinner,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { apiUrl } from '../../../components/Config/Config'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

const Submit = () => {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        type ? `${apiUrl}/api/submissions?type=agreement` : `${apiUrl}/api/submissions`,
      )
      setSubmissions(response.data.submissions)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setLoading(false)
    }
  }

  const handleViewSubmission = async (submission, user_id) => {
    try {
      // if (submissions.email !== null) console.log(submission.email)
      // Fetch specific submission data using the documentId
      const user = user_id ?? 7
      const response = await axios.get(
        type
          ? `${apiUrl}/api/submissions/${submission.document_id}/${user}?type=agreement`
          : `${apiUrl}/api/submissions/${submission.document_id}/${user}`,
      )

      // Set the fetched document and submission data to display in the modal
      const documentData = response.data[0].document
      const submissionDetails = response.data[0].data // Assuming the first submission is the one to show

      setCurrentSubmission({
        ...submission,
        documentData: documentData,
        submissionDetails: submissionDetails,
      })

      setViewModalVisible(true)
    } catch (error) {
      console.error('Error fetching submission details:', error)
    }
  }
  const handleViewSubmission2 = async (submission, email) => {
    try {
      // Fetch specific submission data using the documentId
      const response = await axios.get(
        type
          ? `${apiUrl}/api/submissions/${submission.document_id}/email/${email}?type=agreement`
          : `${apiUrl}/api/submissions/${submission.document_id}/email/${email}`,
      )

      // Set the fetched document and submission data to display in the modal
      const documentData = response.data[0].document
      const submissionDetails = response.data[0].data // Assuming the first submission is the one to show

      setCurrentSubmission({
        ...submission,
        documentData: documentData,
        submissionDetails: submissionDetails,
      })

      setViewModalVisible(true)
    } catch (error) {
      console.error('Error fetching submission details:', error)
    }
  }

  const handleCloseModal = () => {
    setViewModalVisible(false)
    setCurrentSubmission(null) // Reset the submission data
  }
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
  return (
    <CContainer>
      <h1>User Submissions</h1>
      {loading ? (
        <CSpinner color="primary" />
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Name/Email</CTableHeaderCell>{' '}
                {/* Added column for user */}
                <CTableHeaderCell scope="col">Document</CTableHeaderCell>
                <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                <CTableHeaderCell scope="col">File</CTableHeaderCell>
                <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {submissions.map((submission, index) => (
                <CTableRow key={submission.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>
                    {submission.user ? submission.user.name : (submission.email ?? 'Unknown')}
                  </CTableDataCell>{' '}
                  {/* Displaying user name */}
                  <CTableDataCell>{submission.document.name}</CTableDataCell>
                  <CTableDataCell>{submission.status}</CTableDataCell>
                  <CTableDataCell>
                    <a
                      href={apiUrl + '/storage/' + submission.document.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </CTableDataCell>
                  <CTableDataCell>
                    {/* <CButton
                      color="info"
                      size="sm"
                      onClick={() => {
                        !(submission.user === null)
                          ? handleViewSubmission(submission, submission.user.id)
                          : handleViewSubmission2(submission, submission.email)
                      }}
                      // onClick={() => handleViewSubmission(submission, 1)}
                      className="me-2"
                    >
                      View
                    </CButton> */}
                    {submission.status !== 'pending' && (
                      <CButton
                        color="info"
                        size="sm"
                        onClick={() => {
                          !(submission.user === null)
                            ? handleViewSubmission(submission, submission.user.id)
                            : handleViewSubmission2(submission, submission.email)
                        }}
                        className="me-2"
                      >
                        View
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* View Modal */}
          <CModal visible={viewModalVisible} onClose={handleCloseModal}>
            <CModalHeader>
              <CModalTitle>View Submission</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {currentSubmission ? (
                <>
                  {Object.keys(currentSubmission.submissionDetails).map((key) =>
                    key !== 'status' &&
                    key !== 'signature' &&
                    key !== 'undefined' &&
                    key !== 'null' ? (
                      <p key={key}>
                        <strong>{capitalizeFirstLetter(key)}:</strong>{' '}
                        {currentSubmission.submissionDetails[key] || 'N/A'}
                      </p>
                    ) : null,
                  )}

                  <p>
                    <strong>Signature:</strong>
                    <img
                      src={currentSubmission.submissionDetails.signature}
                      // src={currentSubmission.submissionDetails.null}
                      alt="Signature"
                      style={{ width: '200px', height: 'auto' }}
                    />
                  </p>
                  <p>
                    <strong>File:</strong>
                    <a
                      href={apiUrl + '/public/storage/' + currentSubmission.documentData.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </a>
                  </p>
                </>
              ) : (
                <p>No submission data available.</p>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={handleCloseModal}>
                Close
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </CContainer>
  )
}

export default Submit

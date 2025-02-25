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
import * as pdfjsLib from 'pdfjs-dist'
import axios from 'axios'
import { toast, Toaster } from 'sonner'
import jsPDF from 'jspdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`



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
  const renderPdfWithFields = async (documentData, inputBoxes, signatureBoxes) => {
    const response = await fetch(`${apiUrl}/public/storage/${documentData.file || documentData.path}`);
    const blob = await response.blob();
    const pdfDoc = await pdfjsLib.getDocument(URL.createObjectURL(blob)).promise;

    const pdf = new jsPDF();

    const scale = 2; // Increase scale for better resolution

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Draw overlay fields
        const pageInputs = inputBoxes[pageNum] || [];
        const pageSignatures = signatureBoxes[pageNum] || [];
        [...pageInputs, ...pageSignatures].forEach((box) => {
            ctx.save();
            ctx.strokeStyle = '#000';
            ctx.strokeRect(
                box.left * scale, // Adjust position for scale
                box.top * scale, // Adjust position for scale
                box.fieldType === 'checkbox' ? 20 * scale : 150 * scale, // Adjust size for scale
                30 * scale // Adjust size for scale
            );

            // Add user data to the PDF
            if (box.value) {
                ctx.fillText(box.value, box.left * scale + 5, box.top * scale + 20); // Adjust position as needed
            }
            ctx.restore();
        });

        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');

        // Add a new page with the correct dimensions
        if (pageNum > 1) pdf.addPage();
        pdf.setPage(pageNum);
        pdf.addImage(imgData, 'PNG', 0, 0, viewport.width / scale, viewport.height / scale); // Adjust size for scale
    }

    return pdf.output('blob');
  };
  const renderFieldsOnDocument = async ( docment, inputBoxes, signatureBoxes ) =>
  {
    if ( typeof window === 'undefined' || typeof docment === 'undefined' )
    {
      console.error( 'This function should only be called in a browser environment' );
      return;
    }

    if ( !docment || ( !docment.file && !docment.path ) )
    {
      throw new Error( 'Invalid document or missing file path' );
    }

    const filePath = docment.file || docment.path;
    const response = await fetch( `${apiUrl}/public/storage/${filePath}` );
    const blob = await response.blob();

    if ( filePath.toLowerCase().endsWith( '.pdf' ) )
    {
      const pdfDoc = await pdfjsLib.getDocument( URL.createObjectURL( blob ) ).promise;
      const canvas = document.createElement( 'canvas' );
      const ctx = canvas.getContext( '2d' );

      for ( let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++ )
      {
        const page = await pdfDoc.getPage( pageNum );
        const viewport = page.getViewport( { scale: 1 } );

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render( {
          canvasContext: ctx,
          viewport: viewport,
        } ).promise;

        const pageInputs = inputBoxes[ pageNum ] || [];
        const pageSignatures = signatureBoxes[ pageNum ] || [];

        [ ...pageInputs, ...pageSignatures ].forEach( ( box ) =>
        {
          ctx.save();
          ctx.strokeStyle = '#000';
          ctx.strokeRect( box.left, box.top, box.fieldType === 'checkbox' ? 20 : 150, 30 );
          ctx.restore();
        } );
      }

      return new Promise( ( resolve, reject ) =>
      {
        canvas.toBlob( ( blob ) =>
        {
          if ( blob )
          {
            resolve( blob );
          } else
          {
            reject( new Error( 'Failed to create PDF blob' ) );
          }
        }, 'application/pdf' );
      } );
    } else if ( filePath.toLowerCase().endsWith( '.docx' ) )
    {
      const arrayBuffer = await blob.arrayBuffer();
      const result = await mammoth.convertToHtml( { arrayBuffer } );
      let html = result.value;

      Object.entries( inputBoxes ).forEach( ( [ page, boxes ] ) =>
      {
        boxes.forEach( ( box ) =>
        {
          const marker = `<div style="position:absolute;left:${box.left}px;top:${box.top}px;border:1px solid black;width:150px;height:30px"></div>`;
          html += marker;
        } );
      } );

      return new Blob( [ html ], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      } );
    }
  };


  const handleDownload = async ( doc ) =>
  { // Renamed parameter to avoid shadowing
    try
    {
      if ( !doc?.id )
      {
        console.error( 'No document ID provided' );
        toast.error( 'Document not found' );
        return;
      }

      const response = await axios.get( `${apiUrl}/api/documents/pending/${doc.id}/` );
      const documentData = response.data.document[ 0 ];

      const inputBoxesFromServer = documentData.input_boxes ? JSON.parse( documentData.input_boxes ) : [];
      const signatureBoxesFromServer = documentData.signature_boxes ? JSON.parse( documentData.signature_boxes ) : [];

      const inputBoxesByPage = {};
      inputBoxesFromServer.forEach( ( box ) =>
      {
        inputBoxesByPage[ box.page ] = [
          ...( inputBoxesByPage[ box.page ] || [] ),
          { ...box, isExpanded: false },
        ];
      } );

      const signatureBoxesByPage = {};
      signatureBoxesFromServer.forEach( ( box ) =>
      {
        signatureBoxesByPage[ box.page ] = [
          ...( signatureBoxesByPage[ box.page ] || [] ),
          { ...box, isExpanded: false },
        ];
      } );

      const modifiedBlob = await renderFieldsOnDocument( documentData, inputBoxesByPage, signatureBoxesByPage );

      if ( !modifiedBlob )
      {
        throw new Error( 'Failed to generate document blob' );
      }

      const url = URL.createObjectURL( modifiedBlob );
      const a = document.createElement( 'a' );
      a.href = url;
      a.download = documentData.name || 'document';
      document.body.appendChild( a );
      a.click();
      document.body.removeChild( a );
      URL.revokeObjectURL( url );

      toast.success( 'Document downloaded successfully!' );
    } catch ( error )
    {
      console.error( 'Error downloading document:', error );
      toast.error( 'Failed to download document: ' + error.message );
    }
  };
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
   console.log( submissions )
  return (
    <CContainer>
      <Toaster />
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
                    <CButton
                      color="primary"
                      size="sm"
                      onClick={() => handleDownload( submission.document )}
                    >
                      Download with Fields
                    </CButton>
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

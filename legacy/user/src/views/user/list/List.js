import React, { useState, useEffect } from 'react';
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
  CForm,
  CFormLabel,
  CFormInput
} from '@coreui/react';
import { apiUrl } from "../../../components/Config/Config";
import axios from 'axios';

const List = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user/`);
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${apiUrl}/api/user/${id}/`);
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({ name: user.name, email: user.email, password: '' });
    setEditModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${apiUrl}/api/user/${currentUser.id}/`, formData);
      fetchUsers(); // Refresh the user list
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <CContainer>
      <h1>User List</h1>
      {loading ? (
        <CSpinner color="primary" />
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((user, index) => (
                <CTableRow key={user.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{user.name}</CTableDataCell>
                  <CTableDataCell>{user.email}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="warning"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="me-2"
                    >
                      Edit
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Edit Modal */}
          <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
            <CModalHeader>
              <CModalTitle>Edit User</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm>
                <div className="mb-3">
                  <CFormLabel htmlFor="name">Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="email">Email</CFormLabel>
                  <CFormInput
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="password">Password</CFormLabel>
                  <CFormInput
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank if you don't want to change"
                  />
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
                Close
              </CButton>
              <CButton color="primary" onClick={handleUpdate}>
                Save changes
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </CContainer>
  );
};

export default List;

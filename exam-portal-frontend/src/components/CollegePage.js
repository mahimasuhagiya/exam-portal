import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/styles.css";
import API_URL from "./../services/authService";
import showToastConfirmation from "./toast";

const CollegePage = () => {
  const [collegeData, setCollegeData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [newCollege, setNewCollege] = useState({ name: "", address: "" });
  const token = localStorage.getItem("jwtToken");

  // Fetch college data
  useEffect(() => {
    const fetchColleges = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${API_URL}/colleges`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setCollegeData(response.data);
      } catch (error) {
        toast.error("Error fetching college data!");
      }
    };

    fetchColleges();
  }, [token]);

  // Toggle modal and reset form if it's not open
  const toggleModal = (flag) => {
    setIsModalOpen(!isModalOpen);
      if(flag){
        setNewCollege({ name: "", address: "" });  // Reset when opening
        setIsEditing(false); // Reset editing mode when opening the modal        
      }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCollege((prev) => ({ ...prev, [name]: value }));
  };

  // Save College (Add/Edit)
  const saveCollege = async () => {
    if (!newCollege.name || !newCollege.address) {
      toast.warn("Please fill out all fields.", { position: "top-center" });
      return;
    }

    const saveCallback = async () => {
      try {
        if (isEditing) {
          const response = await axios.put(
            `${API_URL}/colleges`,
            newCollege,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setCollegeData((prev) =>
            prev.map((college) =>
              college.id === selectedCollege.id ? response.data : college
            )
          );
          toast.success("College updated successfully!");
        } else {
          const response = await axios.post(`${API_URL}/colleges`, newCollege, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          setCollegeData([...collegeData, response.data]);
          toast.success("College added successfully!");
        }

        toggleModal();
      } catch (error) {
        toast.error("Error saving college. Please try again.");
      }
    };

    showToastConfirmation(isEditing ? "update" : "add","College", saveCallback);
  };

  // Delete College
  const deleteCollege = (id) => {
    const deleteCallback = async () => {
      try {
        await axios.delete(`${API_URL}/colleges/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setCollegeData((prev) => prev.filter((college) => college.id !== id));
        toast.success("College deleted successfully!");
      } catch (error) {
        toast.error("Error deleting college. Please try again.");
      }
    };

    showToastConfirmation("delete", "College.", deleteCallback,"All the students of this collge will also get deleted");
  };

  // Open Edit Form
  const openEditForm = (college) => {
    setSelectedCollege(college);
    setIsEditing(true); // Set editing mode
    setNewCollege({ id: college.id, name: college.name, address: college.address }); // Fill in the current college's data
    toggleModal(); // Open the modal
  };

  // Filter data based on search
  const filteredData = collegeData.filter(
    (college) =>
      college.name.toLowerCase().includes(searchText.toLowerCase()) ||
      college.address.toLowerCase().includes(searchText.toLowerCase())
  ).sort((a, b) => b.id - a.id);

  // Columns for DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div>
          <button
            className="btn btn-primary btn-sm mr-2"
            onClick={() => openEditForm(params.row)}
          >
            Edit
          </button>&nbsp;
          <button
            className="btn btn-danger btn-sm"
            onClick={() => deleteCollege(params.row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer />
      <h1 className="text-center mb-4">College Management</h1>

      {/* Search Input */}
      <div className="d-flex justify-content-between mb-4">
        <input
          type="text"
          placeholder="Search Colleges"
          className="form-control"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className="btn btn-primary ml-4"   onClick={() => toggleModal(true)}>
          Add College
        </button>
      </div>

      {/* DataGrid */}
      <div style={{ width: "100%" }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 15]}
        />
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <div className="modal-content">
          <div className="modal-header">
            {isEditing ? "Edit College" : "Add College"}
          </div>
          <div className="modal-body">
            <form>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={newCollege.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={newCollege.address}
                  onChange={handleInputChange}
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={toggleModal}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveCollege}>
              {isEditing ? "Edit" : "Add"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CollegePage;

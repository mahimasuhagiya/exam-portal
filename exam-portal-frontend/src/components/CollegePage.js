import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/styles.css";
import API_URL, { getWithExpiry } from "./../services/authService";
import showToastConfirmation from "./toast";
import Papa from "papaparse";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";


const CollegePage = () => {
  const [collegeData, setCollegeData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [newCollege, setNewCollege] = useState({ name: "", address: "" });
  const [errors, setErrors] = useState({ name: "", address: "" }); // Validation errors
  const token = getWithExpiry('jwtToken');

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

  const toggleModal = (flag) => {
    setIsModalOpen(!isModalOpen);
    if (flag) {
      setNewCollege({ name: "", address: "" });
      setIsEditing(false);
      setErrors({ name: "", address: "" }); // Reset errors
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCollege((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let isValid = true;
    let errors = { name: "", address: "" };

    if (!newCollege.name.trim()) {
      errors.name = "Name is required.";
      isValid = false;
    }

    if (!newCollege.address.trim()) {
      errors.address = "Address is required.";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const saveCollege = async () => {
    if (!validateForm()) {
      toast.warn("Please correct the errors before submitting.");
      return;
    }

    const saveCallback = async () => {
      try {
        if (isEditing) {
          const response = await axios.put(`${API_URL}/colleges`, newCollege, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
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

    showToastConfirmation(isEditing ? "update" : "add", "College", saveCallback);
  };

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

    showToastConfirmation("delete", "College.", deleteCallback, "All the students of this college will also get deleted");
  };

  const openEditForm = (college) => {
    setSelectedCollege(college);
    setIsEditing(true);
    setNewCollege({ id: college.id, name: college.name, address: college.address });
    setErrors({ name: "", address: "" }); // Reset errors when opening edit
    toggleModal();
  };

  const filteredData = collegeData
    .filter(
      (college) =>
        college.name.toLowerCase().includes(searchText.toLowerCase()) ||
        college.address.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => b.id - a.id);

    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const toggleExportDropdown = () => setExportDropdownOpen(prev => !prev);
    const exportToCSV = () => {
      try {
        const csv = Papa.unparse(collegeData); // Convert JSON to CSV format
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
    
        const link = document.createElement("a");
        link.href = url;
        link.download = "colleges.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV file downloaded successfully!");
      } catch (error) {
        toast.error("Error exporting CSV!");
      }
    };

    const exportToExcel = () => {
      try {
        const worksheet = XLSX.utils.json_to_sheet(collegeData.map(college => ({
          ID: college.id,
          Name: college.name,
          Address: college.address
        })));
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Colleges");
        XLSX.writeFile(workbook, "colleges.xlsx");
        toast.success("Excel file downloaded successfully!");
      } catch (error) {
        toast.error("Error exporting Excel file!");
      }
    };
    
    const exportToPDF = () => {
      try {
        const doc = new jsPDF();
        doc.text("College List", 20, 20);
        
        let yPos = 30;
        collegeData.forEach(college => {
          doc.text(`ID: ${college.id}`, 20, yPos);
          doc.text(`Name: ${college.name}`, 20, yPos + 10);
          doc.text(`Address: ${college.address}`, 20, yPos + 20);
          yPos += 30;
          
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
        });
        
        doc.save("colleges.pdf");
        toast.success("PDF file downloaded successfully!");
      } catch (error) {
        toast.error("Error exporting PDF!");
      }
    };
    
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
          <button className="btn btn-primary btn-sm mr-2" onClick={() => openEditForm(params.row)}>
            Edit
          </button>
          &nbsp;
          <button className="btn btn-danger btn-sm" onClick={() => deleteCollege(params.row.id)}>
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

      <div className="d-flex justify-content-between mb-4">
        <input
          type="text"
          placeholder="Search Colleges"
          className="form-control"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className="btn btn-primary ml-4" onClick={() => toggleModal(true)}>
          Add College
        </button>
        
        <div className="d-flex align-items-center">
    <Dropdown 
      isOpen={exportDropdownOpen} 
      toggle={toggleExportDropdown}
      className="ml-4"
    >
      <DropdownToggle className="btn btn-success" style={{ height: "63px" }}>
        Export
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={exportToCSV}>
          <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
          CSV
        </DropdownItem>
        <DropdownItem onClick={exportToExcel}>
          <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
          Excel
        </DropdownItem>
        <DropdownItem onClick={exportToPDF}>
          <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
          PDF
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
     
      </div>
      <div style={{ width: "100%" }}>
        <DataGrid rows={filteredData} columns={columns} pageSize={10} rowsPerPageOptions={[5, 10, 15]} 
        // initialState={{
        //   sorting: {
        //     sortModel: [{ field: "id", sort: "asc" }], // Initial sorting by ID ascending
        //   },
        // }}
        />
      </div>

      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <div className="modal-content">
          <div className="modal-header">{isEditing ? "Edit College" : "Add College"}</div>
          <div className="modal-body">
            <form>
              <div className="form-group">
                <label>Name: *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={newCollege.name}
                  onChange={handleInputChange}
                />
                {errors.name && <small style={{ color: "red" }}>{errors.name}</small>}
              </div>
              <div className="form-group">
                <label>Address: *</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={newCollege.address}
                  onChange={handleInputChange}
                />
                {errors.address && <small style={{ color: "red" }}>{errors.address}</small>}
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

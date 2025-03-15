import axios from "axios";
import React, { useEffect, useState } from "react";
import API_URL, { getWithExpiry } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import showToastConfirmation from "./toast";
import "../css/styles.css";
import Papa from "papaparse";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const Difficulty = () => {
    const [difficultyData, setDifficultyData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [newLevel, setNewLevel] = useState({ name: "" });
    const [errors, setErrors] = useState({}); // State for validation errors
    const token = getWithExpiry('jwtToken');

    // Fetch difficulty level data
    useEffect(() => {
        const fetchLevels = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${API_URL}/difficulty`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setDifficultyData(response.data);
            } catch (error) {
                toast.error("Error fetching difficulty levels data!");
            }
        };

        fetchLevels();
    }, [token]);

    // Toggle modal and reset form if it's not open
    const toggleModal = (flag) => {
        setIsModalOpen(!isModalOpen);
        if (flag) {
            setNewLevel({ name: "" }); // Reset when opening
            setIsEditing(false); // Reset editing mode when opening the modal
            setErrors({}); // Reset validation errors
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLevel((prev) => ({ ...prev, [name]: value }));
        // Clear the error for the field when it changes
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!newLevel.name) newErrors.name = "Name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save difficulty level (Add/Edit)
    const saveLevel = async () => {
        if (!validateForm()) return; // Stop if validation fails

        const saveCallback = async () => {
            try {
                if (isEditing) {
                    const response = await axios.put(
                        `${API_URL}/difficulty_levels`,
                        newLevel,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    setDifficultyData((prev) =>
                        prev.map((level) =>
                            level.id === selectedLevel.id ? response.data : level
                        )
                    );
                    toast.success("Difficulty level updated successfully!");
                } else {
                    const response = await axios.post(`${API_URL}/difficulty`, newLevel, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setDifficultyData([...difficultyData, response.data]);
                    toast.success("Difficulty level added successfully!");
                }

                toggleModal();
            } catch (error) {
                toast.error("Error saving difficulty level. Please try again.");
            }
        };

        showToastConfirmation(isEditing ? "update" : "add", "Difficulty Level", saveCallback);
    };

    // Delete Difficulty Level
    const deleteLevel = (id) => {
        const deleteCallback = async () => {
            try {
                await axios.delete(`${API_URL}/difficulty/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setDifficultyData((prev) => prev.filter((level) => level.id !== id));
                toast.success("Difficulty level deleted successfully!");
            } catch (error) {
                toast.error("Error deleting difficulty level. Please try again.");
            }
        };

        showToastConfirmation("delete", "Difficulty Level.", deleteCallback, "All the Questions and Exams with this difficulty level will get deleted.");
    };

    // Open Edit Form
    const openEditForm = (level) => {
        setSelectedLevel(level);
        setIsEditing(true); // Set editing mode
        setNewLevel({ id: level.id, name: level.name }); // Fill in the current level's data
        toggleModal(); // Open the modal
    };

    // Filter data based on search
    const filteredData = difficultyData.filter(
        (level) => level.name.toLowerCase().includes(searchText.toLowerCase())
    ).sort((a, b) => b.id - a.id);

    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const toggleExportDropdown = () => setExportDropdownOpen(prev => !prev);

    const exportToCSV = () => {
        try{
            if (difficultyData.length === 0) {
            toast.warn("No data available to export.");
            return;
            }

        const csvData = difficultyData.map((level) => ({
            ID: level.id,
            Name: level.name,
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", "difficulty_levels.csv");
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
          const worksheet = XLSX.utils.json_to_sheet(difficultyData.map(level => ({
            ID: level.id,
            Name: level.name
          })));
          
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Difficulty Levels");
          XLSX.writeFile(workbook, "difficulty_levels.xlsx");
          toast.success("Excel file downloaded successfully!");
        } catch (error) {
          toast.error("Error exporting Excel file!");
        }
      };
      
      const exportToPDF = () => {
        try {
          const doc = new jsPDF();
          doc.text("Difficulty Levels List", 20, 20);
          
          let yPos = 30;
          difficultyData.forEach(level => {
            doc.text(`ID: ${level.id}`, 20, yPos);
            doc.text(`Name: ${level.name}`, 20, yPos + 10);
            yPos += 20;
            
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
            }
          });
          
          doc.save("difficulty_levels.pdf");
          toast.success("PDF file downloaded successfully!");
        } catch (error) {
          toast.error("Error exporting PDF!");
        }
      };

    // Columns for DataGrid
    const columns = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "name", headerName: "Name", flex: 1 },
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
                        onClick={() => deleteLevel(params.row.id)}
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
            <h1 className="text-center mb-4">Difficulty Level Management</h1>

            {/* Search Input */}
            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search Difficulty Levels"
                    className="form-control"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn btn-primary ml-4" onClick={() => toggleModal(true)}>
                    Add Difficulty Level
                </button>
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

            {/* DataGrid */}
            <div style={{ width: "100%" }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    // initialState={{
                    //     sorting: {
                    //       sortModel: [{ field: "id", sort: "asc" }], // Initial sorting by ID ascending
                    //     },
                    //   }}
                />
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} toggle={toggleModal}>
    <div className="modal-content">
        <div className="modal-header">
            {isEditing ? "Edit Difficulty Level" : "Add Difficulty Level"}
        </div>
        <div className="modal-body">
            <form>
                <div className="form-group">
                    <label>Difficulty Level: *</label> {/* Added asterisk */}
                    <select
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        name="name"
                        value={newLevel.name}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Difficulty Level</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
            </form>
        </div>
        <div className="modal-footer">
            <button className="btn btn-secondary" onClick={toggleModal}>
                Cancel
            </button>
            <button className="btn btn-primary" onClick={saveLevel}>
                {isEditing ? "Edit" : "Add"}
            </button>
        </div>
    </div>
</Modal>
        </div>
    );
};

export default Difficulty;
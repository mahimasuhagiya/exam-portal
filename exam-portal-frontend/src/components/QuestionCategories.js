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

const QuestionCategories = () => {
    const [CategoryData, setCategoryData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: "" });
    const [errors, setErrors] = useState({}); // State for validation errors
    const token = getWithExpiry("jwtToken");

    // Fetch question category data
    useEffect(() => {
        const fetchCategories = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${API_URL}/question_categories`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setCategoryData(response.data);
            } catch (error) {
                toast.error("Error fetching categories data!");
            }
        };

        fetchCategories();
    }, [token]);

    // Toggle modal and reset form if it's not open
    const toggleModal = (flag) => {
        setIsModalOpen(!isModalOpen);
        if (flag) {
            setNewCategory({ name: "" }); // Reset when opening
            setIsEditing(false); // Reset editing mode when opening the modal
            setErrors({}); // Reset validation errors
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory((prev) => ({ ...prev, [name]: value }));
        // Clear the error for the field when it changes
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!newCategory.name) newErrors.name = "Name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save category (Add/Edit)
    const saveCategory = async () => {
        if (!validateForm()) return; // Stop if validation fails

        const saveCallback = async () => {
            try {
                if (isEditing) {
                    const response = await axios.put(
                        `${API_URL}/question_categories`,
                        newCategory,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    setCategoryData((prev) =>
                        prev.map((category) =>
                            category.id === selectedCategory.id ? response.data : category
                        )
                    );
                    toast.success("Category updated successfully!");
                } else {
                    const response = await axios.post(`${API_URL}/question_categories`, newCategory, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setCategoryData([...CategoryData, response.data]);
                    toast.success("Category added successfully!");
                }

                toggleModal();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation(isEditing ? "update" : "add", "Category", saveCallback);
    };

    // Delete Category
    const deleteCategory = (id) => {
        const deleteCallback = async () => {
            try {
                await axios.delete(`${API_URL}/question_categories/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setCategoryData((prev) => prev.filter((category) => category.id !== id));
                toast.success("Category deleted successfully!");
            } catch (error) {
                toast.error("Error deleting category. Please try again.");
            }
        };
        showToastConfirmation("delete", "Category", deleteCallback, "All questions of this category will be deleted.");
    };

    // Open Edit Form
    const openEditForm = (category) => {
        setSelectedCategory(category);
        setIsEditing(true); // Set editing mode
        setNewCategory({ id: category.id, name: category.name }); // Fill in the current category's data
        toggleModal(); // Open the modal
    };

    // Filter data based on search
    const filteredData = CategoryData.filter(
        (category) => category.name.toLowerCase().includes(searchText.toLowerCase())
    ).sort((a, b) => b.id - a.id);

    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const toggleExportDropdown = () => setExportDropdownOpen(prev => !prev);

    const exportToCSV = () => {
        try{
        if (CategoryData.length === 0) {
            toast.warn("No data available to export.");
            return;
        }
        const csvData = CategoryData.map((category) => ({
            ID: category.id,
            Name: category.name,
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "question_categories.csv");
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
          const worksheet = XLSX.utils.json_to_sheet(CategoryData.map(category => ({
            ID: category.id,
            Name: category.name
          })));
          
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
          XLSX.writeFile(workbook, "question_categories.xlsx");
          toast.success("Excel file downloaded successfully!");
        } catch (error) {
          toast.error("Error exporting Excel file!");
        }
      };
      
      const exportToPDF = () => {
        try {
          const doc = new jsPDF();
          doc.text("Question Categories List", 20, 20);
          
          let yPos = 30;
          CategoryData.forEach(category => {
            doc.text(`ID: ${category.id}`, 20, yPos);
            doc.text(`Name: ${category.name}`, 20, yPos + 10);
            yPos += 20;
            
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
            }
          });
          
          doc.save("question_categories.pdf");
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
                        onClick={() => deleteCategory(params.row.id)}
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
            <h1 className="text-center mb-4">Question Category Management</h1>

            {/* Search Input */}
            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search Categories"
                    className="form-control"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn btn-primary ml-4" onClick={() => toggleModal(true)}>
                    Add Category
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
                        {isEditing ? "Edit Question Category" : "Add Question Category"}
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label>Category: *</label> {/* Added asterisk */}
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                    name="name"
                                    value={newCategory.name}
                                    onChange={handleInputChange}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={toggleModal}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={saveCategory}>
                            {isEditing ? "Edit" : "Add"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default QuestionCategories;
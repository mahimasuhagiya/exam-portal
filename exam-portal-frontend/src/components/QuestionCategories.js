import axios from "axios";
import React, { useEffect, useState } from "react";
import API_URL from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import showToastConfirmation from "./toast";
import "../css/styles.css";

const QuestionCategories = () => {
    const [CategoryData, setCategoryData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: "" });
    const token = localStorage.getItem("jwtToken");

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
            setNewCategory({ name: "" });  // Reset when opening
            setIsEditing(false); // Reset editing mode when opening the modal        
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory((prev) => ({ ...prev, [name]: value }));
    };

    // Save category (Add/Edit)
    const saveCategory = async () => {
        if (!newCategory.name) {
            toast.warn("Please fill out all fields.", { position: "top-center" });
            return;
        }

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
        showToastConfirmation("delete", "Category", deleteCallback, "All question of this category will be deleted.");
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
                        {isEditing ? "Edit Question Category" : "Add Question Category"}
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={newCategory.name}
                                    onChange={handleInputChange}
                                />
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
}
export default QuestionCategories;
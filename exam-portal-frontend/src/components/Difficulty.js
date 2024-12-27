import axios from "axios";
import React, { useEffect, useState } from "react";
import API_URL from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import showToastConfirmation from "./toast";
import "../css/styles.css";

const Difficulty = () => {
    const [difficultyData, setDifficultyData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null); 
    const [newLevel, setNewLevel] = useState({ name: "" }); 
    const token = localStorage.getItem("jwtToken");

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
            setNewLevel({ name: "" });  // Reset when opening
            setIsEditing(false); // Reset editing mode when opening the modal        
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLevel((prev) => ({ ...prev, [name]: value }));
    };

    // Save difficulty level (Add/Edit)
    const saveLevel = async () => {
        if (!newLevel.name) {
            toast.warn("Please fill out all fields.", { position: "top-center" });
            return;
        }

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

        showToastConfirmation("delete", "Difficulty Level", deleteCallback);
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
                        {isEditing ? "Edit Difficulty Level" : "Add Difficulty Level"}
                    </div>
                    <div className="modal-body">
                        <form> 
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={newLevel.name}
                                    onChange={handleInputChange}
                                />
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

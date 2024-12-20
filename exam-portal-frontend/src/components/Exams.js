import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import showToastConfirmation from "./toast";
import "../css/styles.css";

const Exams = () => {
    const [examsData, setExamsData] = useState([]);
    const [difficultiesData, setDifficultiesData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [newExam, setNewExam] = useState({
        title: "",
        difficulty: { id: "" },
        durationMinutes: "",
        numberOfQuestions: "",
        active: true, 
    });
    const token = localStorage.getItem("jwtToken");

    // Fetch exams data
    const fetchExams = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_URL}/exams`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setExamsData(response.data);
        } catch (error) {
            toast.error("Error fetching exams data!");
        }
    };

    const fetchDifficulties = async () => {
        try {
            const response = await axios.get(`${API_URL}/difficulty`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setDifficultiesData(response.data);
        } catch (error) {
            toast.error("Error fetching difficulties data!");
        }
    };

    useEffect(() => {
        fetchExams();
        fetchDifficulties();
    }, [token]);

    // Toggle modal and reset form
    const toggleModal = (flag) => {
        setIsModalOpen(!isModalOpen);
        if (flag) {
            setNewExam({
                title: "",
                difficulty: { id: "" },
                durationMinutes: "",
                numberOfQuestions: "",
                active: true,
            });
            setIsEditing(false);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "difficulty") {
            setNewExam((prev) => ({ ...prev, difficulty: { id: value } }));
        } else {
            setNewExam((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Save exam (Add/Edit)
    const saveExam = async () => {
        if (!newExam.title || !newExam.difficulty.id) {
            toast.warn("Please fill out all required fields.");
            return;
        }

        const saveCallback = async () => {
            try {
                if (isEditing) {
                    const response = await axios.put(`${API_URL}/exams`, newExam, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setExamsData((prev) =>
                        prev.map((exam) =>
                            exam.id === selectedExam.id ? response.data : exam
                        )
                    );
                    toast.success("Exam updated successfully!");
                } else {
                    const response = await axios.post(`${API_URL}/exams`, newExam, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setExamsData([...examsData, response.data]);
                    toast.success("Exam added successfully!");
                }

                toggleModal();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation(isEditing ? "update" : "add", "Exam", saveCallback);
    };

    const toggleExamStatus = (id) => {
        const exam = examsData.find((e) => e.id === id);
        const action = exam.active ? "deactivate" : "activate";
        const toggleCallback = async () => {
            try {
                const response = await axios.put(
                    `${API_URL}/exams/status/${id}`,
                    { isActive: !exam.active },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                setExamsData((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, active: response.data.active } : e))
                );
                toast.success(`Exam ${response.data.active ? "activated" : "deactivated"} successfully!`);
            } catch (error) {
                toast.error("Error which changing exam status. Please try again.");
            }
        };
    
        showToastConfirmation(
            action,
            `exam "${exam.title}"`,
            toggleCallback
        );
    };

    // Delete exam
    const deleteExam = (id) => {
        const deleteCallback = async () => {
            try {
                await axios.delete(`${API_URL}/exams/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setExamsData((prev) => prev.filter((exam) => exam.id !== id));
                toast.success("Exam deleted successfully!");
            } catch (error) {
                toast.error("Error deleting exam. Please try again.");
            }
        };

        showToastConfirmation("delete", "Exam", deleteCallback);
    };

    // Open Edit Form
    const openEditForm = (exam) => {
        setSelectedExam(exam);
        setIsEditing(true);
        setNewExam({
            id: exam.id,
            title: exam.title,
            difficulty: exam.difficulty,
            durationMinutes: exam.durationMinutes,
            numberOfQuestions: exam.numberOfQuestions,
            active: exam.active,
        });
        toggleModal();
    };

    // Filtered exams based on search text
    const filteredData = examsData.filter((exam) =>
        exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
        exam.difficulty?.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Columns for DataGrid
    const columns = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "title", headerName: "Title", flex: 1 },
        {
            field: "difficulty",
            headerName: "Difficulty",
            flex: 1,
            renderCell: (params) => <div>{params.row.difficulty?.name || "N/A"}</div>,
        },
        { field: "durationMinutes", headerName: "Duration (mins)", flex: 1 },
        { field: "numberOfQuestions", headerName: "Number of Questions", flex: 1 },
        {
            field: "isActive",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <button
                    className={`btn btn-${params.row.active ? "secondary" : "success"} btn-sm mr-2`}
                    onClick={() => toggleExamStatus(params.row.id)}
                >
                    {params.row.active ? "Deactivate" : "Activate"}
                </button>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
                <div>
                    <button className="btn btn-primary btn-sm mr-2" onClick={() => openEditForm(params.row)}>
                        Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteExam(params.row.id)}>
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <ToastContainer />
            <h1 className="text-center mb-4">Manage Exams</h1>

            {/* Search Input */}
            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search Exams"
                    className="form-control"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn btn-primary ml-4" onClick={() => toggleModal(true)}>
                    Add Exam
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
                    <div className="modal-header">{isEditing ? "Edit Exam" : "Add Exam"}</div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label>Title:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={newExam.title}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Difficulty:</label>
                                <select
                                    className="form-control"
                                    name="difficulty"
                                    value={newExam.difficulty.id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Difficulty</option>
                                    {difficultiesData.map((difficulty) => (
                                        <option key={difficulty.id} value={difficulty.id}>
                                            {difficulty.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Duration (minutes):</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="durationMinutes"
                                    value={newExam.durationMinutes}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Number of questions:</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="numberOfQuestions"
                                    value={newExam.numberOfQuestions}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={toggleModal}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={saveExam}>
                            {isEditing ? "Edit" : "Add"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Exams;

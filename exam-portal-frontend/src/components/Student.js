import axios from "axios";
import React, { useEffect, useState } from "react";
import API_URL, { getWithExpiry } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import showToastConfirmation from "./toast";
import "../css/styles.css";

const Student = () => {
    const [studentsData, setStudentsData] = useState([]);
    const [collegesData, setCollegesData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newStudent, setNewStudent] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        college: { id: "" ,name:""},
        role: "STUDENT",
        isActive: true,
    });
    const token = getWithExpiry("jwtToken");
    // Fetch students data
    const fetchStudents = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_URL}/users/role/student`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setStudentsData(response.data);
        } catch (error) {
            toast.error("Error fetching students data!");
        }
    };

    const fetchColleges = async () => {
        try {
            const response = await axios.get(`${API_URL}/colleges`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setCollegesData(response.data);
        } catch (error) {
            toast.error("Error fetching colleges data!");
        }
    };
    useEffect(() => {     
        fetchStudents();
        fetchColleges();
    }, [token]);

    // Toggle modal and reset form if it's not open
    const toggleModal = (flag) => {
         fetchColleges();
        setIsModalOpen(!isModalOpen);
        if (flag) {
            setNewStudent({
                name: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                college: { id: "",name:""},
                role: "STUDENT",
                isActive: true,
            }); // Reset form
            setIsEditing(false); // Reset editing mode when opening the modal
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name == "college") {
            setNewStudent((prev) => ({ ...prev, college: { id: value, name: collegesData.filter((clg) => clg.id = value )[0].name} }));
        } else {
            setNewStudent((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Save student (Add/Edit)
    const saveStudent = async () => {
        if (!newStudent.name || !newStudent.email || !newStudent.college.id) {
            toast.warn("Please fill out all fields.", { position: "top-center" });
            return;
        }

        const saveCallback = async () => {
            try {
                if (isEditing) {
                    const response = await axios.put(`${API_URL}/users`, newStudent, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setStudentsData((prev) =>
                        prev.map((student) =>
                            student.id === selectedStudent.id ? response.data : student
                        )
                    );
                    toast.success("Student updated successfully!");
                } else {
                    const response = await axios.post(`${API_URL}/users`, newStudent, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setStudentsData([...studentsData, response.data]);
                    toast.success("Student added successfully!");
                }

                toggleModal();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation(isEditing ? "update" : "add", "Student", saveCallback);
    };

    // Toggle student active status
    const toggleStudentStatus = (id) => {
        const student = studentsData.find((s) => s.id === id);
        const action = student.active ? "deactivate" : "activate";
        const toggleCallback = async () => {
            try {
                const response = await axios.put(
                    `${API_URL}/users/status/${id}`,
                    { isActive: !student.active },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                setStudentsData((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, active: response.data.active } : s))
                );
                toast.success(`Student ${response.data.active ? "activated" : "deactivated"} successfully!`);
            } catch (error) {
                toast.error("Error while changing student status. Please try again.");
            }
        };
    
        showToastConfirmation(
            action,
            `student "${student.name}"`,
            toggleCallback
        );
    };
    

    const deleteStudent = (id) => {
        const deleteCallback = async () => {
            try {
                await axios.delete(`${API_URL}/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setStudentsData((prev) => prev.filter((student) => student.id !== id));
                toast.success("Student deleted successfully!");
            } catch (error) {
                toast.error("Error deleting student. Please try again.");
            }
        };

        showToastConfirmation("delete", "student.", deleteCallback,"All results of the student will also get deleted");
    };

    // Open Edit Form
    const openEditForm = (student) => {
        setSelectedStudent(student);
        setIsEditing(true); // Set editing mode
        setNewStudent({
            id: student.id,
            name: student.name,
            email: student.email,
            password: student.password,
            phone: student.phone,
            address: student.address,
            college: student.college,
            role: "STUDENT",
            active: student.active,
        });
        toggleModal(); // Open the modal
    };

    // Filter data based on search
    const filteredData = studentsData.filter((student) => 
        student.name?.toLowerCase().includes(searchText.toLowerCase()) || 
        student.college?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.phone?.toString().includes(searchText) ||
        student.address?.toLowerCase().includes(searchText.toLowerCase())
    ).sort((a, b) => b.id - a.id);

    // Columns for DataGrid
    const columns = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "name", headerName: "Name", flex: 1 },
        { field: "college.name", headerName: "College", flex: 1, renderCell: (params) => (
            <div>
                 {params.row.college.name || "N/A"}
            </div>
        ),},
        {
            field: "contactInfo",
            headerName: "Contact Info",
            flex: 2,
            renderCell: (params) => (
                <div style={{ whiteSpace: "normal", lineHeight: "1.5"} }>
                    <div><strong>Email:</strong> {params.row.email || "N/A"} </div>
                    <div><strong>Phone:</strong> {params.row.phone || "N/A"}</div>
                </div>
            ),
        },
        { field: "address", headerName: "Address", flex: 1 },
        {
            field: "isActive",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <button
                    className={`btn btn-${params.row.active ? "secondary" : "success"} btn-sm mr-2`}
                    onClick={() => toggleStudentStatus(params.row.id)}
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
                    <button
                        className="btn btn-primary btn-sm mr-2"
                        onClick={() => openEditForm(params.row)}
                    >
                        Edit
                    </button>&nbsp;
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteStudent(params.row.id)}
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
            <h1 className="text-center mb-4">Manage Students</h1>

            {/* Search Input */}
            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search Students"
                    className="form-control"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn btn-primary ml-4" onClick={() => toggleModal(true)}>
                    Add Student
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
                        {isEditing ? "Edit Student" : "Add Student"}
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={newStudent.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={newStudent.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {!isEditing ?  <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    value={newStudent.password}
                                    onChange={handleInputChange}
                                />
                            </div>: <div></div>}
                            <div className="form-group">
                                <label>Phone:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="phone"
                                    value={newStudent.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="address"
                                    value={newStudent.address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>College:</label>
                                <select
                                    className="form-control"
                                    name="college"
                                    value={newStudent.college.id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select College</option>
                                    {collegesData.map((college) => (
                                        <option key={college.id} value={college.id}>
                                            {college.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={toggleModal}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={saveStudent}>
                            {isEditing ? "Edit" : "Add"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Student;

import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/styles.css";
import API_URL, { getWithExpiry } from "../services/authService";
import showToastConfirmation from "./toast";

const Result = () => {
    const [searchText, setSearchText] = useState("");
    const [resultData, setResultData] = useState([]);
    const token = getWithExpiry("jwtToken");
    useEffect(() => {
        const fetchResults = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${API_URL}/result`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setResultData(response.data);
            } catch (error) {
                toast.error("Error fetching result data!");
            }
        };

        fetchResults();
    }, [token]);

    const columns = [
        { 
            field: "id", 
            headerName: "ID", 
            width: 80, 
        },
        { 
            field: "user.name", 
            headerName: "Student Name", 
            flex: 1,
            renderCell: (params) => params.row.user?.name || "N/A"
        },
        { 
            field: "exam.name", 
            headerName: "Exam", 
            flex: 1,
            renderCell: (params) => params.row.exam?.title || "N/A"
        },
        { 
        field: "Status", 
            headerName: "Status", 
            width: 80, 
            renderCell: (params) => <div>{(params.row.total>=params.row.exam?.passingMarks) ? "Pass" : (params.row.exam?.programming && params.row.checkedBy!==null ) ? "Fail" :params.row.exam?.programming? <strong>Pending</strong>:"Fail"} </div> 
            
        },
        { 
        field: "total", 
            headerName: "Marks", 
            flex: 1,
            renderCell: (params) => params.row.total 
            
        },
        { 
            field: "exam.numberOfQuestions", 
                headerName: "Number Questions", 
                flex: 1,
                renderCell: (params) => params.row.exam?.numberOfQuestions 
                
            },
        { 
            field: "exam.programming", 
            headerName: "Type of exam", 
            flex: 1,
            renderCell: (params) => params.row.exam?.programming ? "Programming":"MCQ"
        },
        { 
            field: "exam.passingMarks", 
            headerName: "Passing C riteria", 
            flex: 1,
            renderCell: (params) => params.row.exam?.passingMarks || "N/A"
        },
        { 
            field: "user.college.name", 
            headerName: "College Name", 
            flex: 1,
            renderCell: (params) => params.row.user?.college?.name || "N/A"
        },
        { 
            field: "generatedAt", 
            headerName: "Generated At", 
            flex: 1,
            renderCell: (params) =>  `${new Date(params.value).toLocaleString("en-GB") }`|| "N/A",
        },
        { 
            field: "checkedBy", 
            headerName: "Checked By", 
            flex: 1,
            renderCell: (params) =>  (params.row.exam?.programming && params.row.checkedBy?.name ==null )? <strong>Pending</strong> : params.row.exam?.programming ?params.row.checkedBy?.name :"System",
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
                <div>
                    <a
                   href={`/examresult/${btoa(String(params.row.user?.id))}/${btoa(String(params.row.exam?.id))}`}

                        className="btn btn-primary btn-sm mr-2"
                                           >
                        Full Details
                    </a>
                </div>
            ),
        },
    ];

    const filteredData = resultData.filter(
        (result) =>
            result.generatedAt.toLowerCase().includes(searchText.toLowerCase()) ||
            result.exam?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            (result.exam?.programming ? "Programming" : "MCQ").toLowerCase().includes(searchText.toLowerCase()) ||
            (result.total >=result.exam?.passingMarks ? "Pass" : "Fail").toLowerCase().includes(searchText.toLowerCase()) ||
            result.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            result.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            result.user?.college?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            result.user?.college?.address?.toLowerCase().includes(searchText.toLowerCase())
    ).sort((a, b) => b.id - a.id);

    return (
        <div>
            <ToastContainer />
            <h1 className="text-center mb-4">Results</h1>

            {/* Search Input */}
            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search here..."
                    className="form-control"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
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
        </div>
    );
};

export default Result;

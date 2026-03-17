const http = require('http');
const url = require('url');

let studentList = [];

function sendJSON(res, status, payload) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
}

function checkStudent(data) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.name || !data.email || !data.course || !data.year) {
        return "All fields are required";
    }

    if (!emailPattern.test(data.email)) {
        return "Invalid email format";
    }

    if (data.year < 1 || data.year > 4) {
        return "Year must be between 1 and 4";
    }

    return null;
}

const server = http.createServer((req, res) => {

    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    const method = req.method;

    // GET ALL STUDENTS
    if (method === "GET" && pathname === "/students") {
        return sendJSON(res, 200, {
            success: true,
            data: studentList
        });
    }

    // GET STUDENT BY ID
    if (method === "GET" && pathname.startsWith("/students/")) {

        const id = pathname.split("/")[2];
        const student = studentList.find(item => item.id === id);

        if (!student) {
            return sendJSON(res, 404, {
                success: false,
                message: "Student not found"
            });
        }

        return sendJSON(res, 200, {
            success: true,
            data: student
        });
    }

    // CREATE STUDENT
    if (method === "POST" && pathname === "/students") {

        let bodyData = "";

        req.on("data", chunk => {
            bodyData += chunk;
        });

        req.on("end", () => {

            const newStudent = JSON.parse(bodyData);
            const validationError = checkStudent(newStudent);

            if (validationError) {
                return sendJSON(res, 400, {
                    success: false,
                    message: validationError
                });
            }

            newStudent.id = Date.now().toString();
            studentList.push(newStudent);

            return sendJSON(res, 201, {
                success: true,
                data: newStudent
            });
        });

        return;
    }

    // UPDATE STUDENT
    if (method === "PUT" && pathname.startsWith("/students/")) {

        const id = pathname.split("/")[2];
        let bodyData = "";

        req.on("data", chunk => {
            bodyData += chunk;
        });

        req.on("end", () => {

            const updatedStudent = JSON.parse(bodyData);
            const index = studentList.findIndex(item => item.id === id);

            if (index === -1) {
                return sendJSON(res, 404, {
                    success: false,
                    message: "Student not found"
                });
            }

            const validationError = checkStudent(updatedStudent);

            if (validationError) {
                return sendJSON(res, 400, {
                    success: false,
                    message: validationError
                });
            }

            updatedStudent.id = id;
            studentList[index] = updatedStudent;

            return sendJSON(res, 200, {
                success: true,
                data: updatedStudent
            });
        });

        return;
    }

    // DELETE STUDENT
    if (method === "DELETE" && pathname.startsWith("/students/")) {

        const id = pathname.split("/")[2];
        const index = studentList.findIndex(item => item.id === id);

        if (index === -1) {
            return sendJSON(res, 404, {
                success: false,
                message: "Student not found"
            });
        }

        studentList.splice(index, 1);

        return sendJSON(res, 200, {
            success: true,
            message: "Student deleted"
        });
    }

    // INVALID ROUTE
    return sendJSON(res, 404, {
        success: false,
        message: "Route not found"
    });

});

server.listen(3001, () => {
    console.log("Server running on port 3001");
});
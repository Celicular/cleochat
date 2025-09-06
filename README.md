
# CleoChat

![CleoChat Logo](public/assets/logo.png)

**A real-time chat application by Himadri Shekhar**

CleoChat is a web-based chat application designed for seamless and real-time communication. It features a simple, intuitive, and visually appealing user interface, making it easy for users to connect and interact with each other.

---

## Features

- **User Authentication:** Secure user registration and login functionality.
- **Real-time Chat:** Instant messaging with a clean and modern interface.
- **User-friendly Design:** A simple and intuitive layout for easy navigation.
- **Invite System:** Users can add contacts using a unique 6-digit invite ID.
- **Responsive Design:** The application is designed to work on both desktop and mobile devices.

---

## Feature Graphics

### Login and Registration

```
+--------------------------------------------------+
|                                                  |
|                    CleoChat                      |
|                                                  |
|   +------------------------------------------+   |
|   |                                          |   |
|   |                  Login/Register              |   |
|   |                                          |   |
|   |   Email:    [__________________]           |   |
|   |   Password: [__________________]           |   |
|   |                                          |   |
|   |                  [ Login ]                 |   |
|   |                                          |   |
|   |   Don't have an account? Register now.     |   |
|   |                                          |   |
|   +------------------------------------------+   |
|                                                  |
+--------------------------------------------------+
```

### Main Chat Interface

```
+-----------------------------------------------------------------+
|  CleoChat                                                       |
+-----------------------------------------------------------------+
|  +-------------------------+----------------------------------+ |
|  |                         |                                  | |
|  |      Your Chats         |      [ Contact Name ]            | |
|  |                         |                                  | |
|  |   +-----------------+   |   +----------------------------+ | |
|  |   |  Contact 1      |   |   |                            | | |
|  |   +-----------------+   |   |  Hi there!                 | | |
|  |   |  Contact 2      |   |   |                            | | |
|  |   +-----------------+   |   +----------------------------+ | |
|  |   |  Contact 3      |   |                                  | |
|  |   +-----------------+   |   +----------------------------+ | |
|  |                         |   |              How are you?  | | |
|  |                         |   |                            | | |
|  |                         |   +----------------------------+ | |
|  |                         |                                  | |
|  |                         |   [ Type your message here...  ] | |
|  |                         |                                  | |
|  +-------------------------+----------------------------------+ |
+-----------------------------------------------------------------+
```

---

## Technologies Used

### Frontend

- **HTML5:** For the structure of the web pages.
- **CSS3:** For styling and layout, including responsive design.
- **JavaScript (ES6+):** For client-side logic and interactivity.
- **Socket.IO Client:** For real-time communication with the server.

### Backend

- **Node.js:** As the JavaScript runtime environment.
- **Express.js:** For building the web server and handling API routes.
- **Socket.IO:** For enabling real-time, bidirectional communication.
- **MySQL2:** As the MySQL database driver for Node.js.
- **bcrypt:** For hashing passwords before storing them in the database.
- **CORS:** For enabling Cross-Origin Resource Sharing.

### What I Didn't Use

- **JavaScript Frameworks:** No frontend frameworks like React, Angular, or Vue.js were used.
- **CSS Frameworks:** No CSS frameworks like Bootstrap or Tailwind CSS were used.
- **External Libraries (Frontend):** The frontend relies on vanilla JavaScript with no external libraries other than the Socket.IO client.

---

## Installation

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **MySQL:** You need a running MySQL database.

### Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/celicular/cleochat.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd cleochat
    ```

3.  **Install NPM packages:**

    ```bash
    npm install
    ```

4.  **Database Setup:**
    - Create a new MySQL database named `cleochat`.
    - Import the `cleochat.sql` file (if provided) or manually create the required tables. The table structure is as follows:

      ```sql
      CREATE TABLE `users` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `pwd` varchar(255) NOT NULL,
        `email` varchar(255) NOT NULL,
        `mobile` varchar(255) NOT NULL,
        `session` varchar(255) NOT NULL,
        `username` varchar(255) NOT NULL,
        `address` varchar(255) NOT NULL,
        PRIMARY KEY (`id`)
      );

      CREATE TABLE `userstatus` (
        `id` int NOT NULL AUTO_INCREMENT,
        `address` varchar(255) NOT NULL,
        `status` varchar(255) DEFAULT 'offline',
        PRIMARY KEY (`id`)
      );

      CREATE TABLE `userpublic` (
        `id` int NOT NULL AUTO_INCREMENT,
        `InviteId` varchar(255) NOT NULL,
        `userAddress` varchar(255) NOT NULL,
        PRIMARY KEY (`id`)
      );

      CREATE TABLE `usercontacts` (
        `id` int NOT NULL AUTO_INCREMENT,
        `address` varchar(255) NOT NULL,
        `contactData` text,
        PRIMARY KEY (`id`)
      );

      CREATE TABLE `chats` (
        `id` int NOT NULL AUTO_INCREMENT,
        `senderaddr` varchar(255) NOT NULL,
        `recieveaddr` varchar(255) NOT NULL,
        `message` text NOT NULL,
        `isread` tinyint(1) DEFAULT '0',
        `issent` tinyint(1) DEFAULT '1',
        `type` varchar(255) DEFAULT 'message',
        `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
      );
      ```

5.  **Database Configuration:**
    - Open `index.js` and update the database connection details:

      ```javascript
      const db = mysql2.createConnection({
          host: 'localhost',
          user: 'your_mysql_user',
          password: 'your_mysql_password',
          database: 'cleochat'
      });
      ```

---

## Deployment

To deploy this application, you can use any service that supports Node.js applications, such as Heroku, AWS, or DigitalOcean.

1.  **Build the application (if necessary):**
    - This project does not have a build step, as it uses plain HTML, CSS, and JavaScript.

2.  **Set up environment variables:**
    - Ensure that your deployment environment has the necessary environment variables for the database connection.

3.  **Start the server:**

    ```bash
    npm start
    ```

---

## Credits

This project was created by **Himadri Shekhar**.

---

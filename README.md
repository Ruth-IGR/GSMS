Group Savings Management System (GSMS)
 Project Overview
The Group Savings Management System (GSMS) is a web-based platform designed to help savings groups manage contributions, track progress toward financial goals, and maintain transparent financial records. This system eliminates manual record-keeping errors and provides real-time visibility into group savings progress.
Problem Statement
Many savings groups struggle with manual record-keeping, unclear processes, and lack of transparency. Members make contributions toward specific group goals—such as emergency funds, investment projects, or community support—but tracking these payments and progress toward goals is inefficient without a digital system. This results in errors, mistrust, delays, and difficulty determining how close the group is to reaching its goals.
Key Features
Authentication & Authorization
•	Secure member and admin login systems
•	Role-based access control
 Member Features
•	View group savings goals and progress
•	Submit contributions with payment references
•	Track contribution status (pending/approved/rejected)
•	Access personal contribution reports
•	User-friendly dashboard
 Admin Features
•	Create and manage group savings goals
•	Approve or reject member contributions
•	Manage member accounts
•	Generate financial reports
•	Comprehensive admin dashboard
 Financial Management
•	Real-time goal progress tracking
•	Contribution history and audit trails
•	Financial reporting capabilities
•	Target amount and deadline monitoring
 Technology Stack
•	Backend: ASP.NET Core
•	Frontend: Razor Pages / MVC
•	Database: SQL Server
•	Authentication: ASP.NET Core Identity
•	Architecture: MVC Pattern
Database Schema
Core Tables
•	Users (UserID, Username, Password, Role)
•	Members (MemberID, UserID, FullName, Phone, JoinDate)
•	Goals (GoalID, Name, TargetAmount, DueDate)
•	Contributions (ContributionID, MemberID, GoalID, Amount, PaymentReference, Status, DateSubmitted, DateApproved)
Getting Started
Prerequisites
•	.NET 6.0 or later
•	SQL Server
•	Visual Studio 2022 or VS Code
Installation
1.	Clone the repository
bash
git clone https://github.com/your-username/group-savings-management-system.git
cd group-savings-management-system
2.	Database Setup
o	Update connection string in appsettings.json
o	Run database migrations
bash
dotnet ef database update
3.	Run the application
bash
dotnet run
4.	Access the application
o	Navigate to https://localhost:7000
o	Use default admin credentials (to be set in initial migration)

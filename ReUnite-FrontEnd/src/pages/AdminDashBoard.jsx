import React from "react";
import "./AdminDashboard.css";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const barData = [
  { name: "Jan", lost: 30, found: 20 },
  { name: "Feb", lost: 45, found: 25 },
  { name: "Mar", lost: 60, found: 40 },
  { name: "Apr", lost: 50, found: 35 },
];

const lineData = [
  { name: "Week 1", claims: 5 },
  { name: "Week 2", claims: 8 },
  { name: "Week 3", claims: 12 },
  { name: "Week 4", claims: 7 },
];

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Lost &amp; Found Admin</h2>
        <a href="#" className="active">
          Dashboard
        </a>
        <a href="#">Settings</a>
        <a href="/AdminLogin">Logout</a>
      </aside>

      <section className="main-content">
        <h1>Dashboard Overview</h1>

        <div className="overview-row">
          <div className="cards">
            <div className="card">
              <h3>Lost Items</h3>
              <p>128</p>
            </div>
            <div className="card">
              <h3>Found Items</h3>
              <p>89</p>
            </div>
            <div className="card">
              <h3>Unclaimed Claims</h3>
              <p>14</p>
            </div>
            <div className="card">
              <h3>Registered Users</h3>
              <p>452</p>
            </div>
          </div>

          <div className="item-status">
            <h2 className="section-heading">Item Status Distribution</h2>
            <div className="chart-container">
              <div className="pie"></div>
            </div>
            <div className="legend">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ background: "#5865f2" }}
                ></div>{" "}
                Lost Items
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ background: "#eb459e" }}
                ></div>{" "}
                Found Items
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ background: "#4752c4" }}
                ></div>{" "}
                Claimed Items
              </div>
            </div>
          </div>
        </div>

        <h2 className="section-heading">Recent Claims</h2>
        <h2 className="section-heading">Recent Claims</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Status</th>
              <th>Location Found</th> {/* Changed header */}
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Black Wallet</td>
              <td>Unclaimed</td>
              <td>hive</td> {/* Updated value */}
              <td>2025-06-21</td>
            </tr>
            <tr>
              <td>Silver Watch</td>
              <td>Claimed</td>
              <td>gaia</td>
              <td>2025-06-19</td>
            </tr>
            <tr>
              <td>Blue Backpack</td>
              <td>Unclaimed</td>
              <td>ccds</td>
              <td>2025-06-18</td>
            </tr>
            <tr>
              <td>Red Umbrella</td>
              <td>Claimed</td>
              <td>NS prime</td>
              <td>2025-06-17</td>
            </tr>
            <tr>
              <td>Green Water Bottle</td>
              <td>Unclaimed</td>
              <td>wooden benches in NS</td>
              <td>2025-06-15</td>
            </tr>
            <tr>
              <td>Black Sunglasses</td>
              <td>Claimed</td>
              <td>wooden benches in SS</td>
              <td>2025-06-14</td>
            </tr>
            <tr>
              <td>Leather Notebook</td>
              <td>Unclaimed</td>
              <td>hive</td>
              <td>2025-06-12</td>
            </tr>
            <tr>
              <td>Silver Ring</td>
              <td>Claimed</td>
              <td>gaia</td>
              <td>2025-06-11</td>
            </tr>
          </tbody>
        </table>

        <div className="charts-row">
          <div className="chart-section">
            <h2 className="section-heading">Monthly Lost vs Found</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lost" fill="#5865f2" />
                  <Bar dataKey="found" fill="#eb459e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-section">
            <h2 className="section-heading">Weekly Claims Trend</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={lineData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="claims"
                    stroke="#4752c4"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

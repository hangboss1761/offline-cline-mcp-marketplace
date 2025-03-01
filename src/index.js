// index.js
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const pLimit = require('p-limit');
const sqlite3 = require('sqlite3').verbose();
const fs_sync = require('fs');

// Database file path
const dbPath = path.join(process.cwd(), 'mcp_services.db');

// Delete existing database file (if exists)
try {
  if (fs_sync.existsSync(dbPath)) {
    fs_sync.unlinkSync(dbPath);
    console.log('Existing database file deleted');
  }
} catch (error) {
  console.error('Error deleting database file:', error);
}

// Create new SQLite database
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS services (
        mcpId TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        author TEXT,
        githubUrl TEXT,
        logoUrl TEXT,
        category TEXT,
        tags TEXT,
        requiresApiKey BOOLEAN,
        isRecommended BOOLEAN,
        githubStars INTEGER,
        downloadCount INTEGER,
        createdAt TEXT,
        updatedAt TEXT,
        isDeleted INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS service_details (
        mcpId TEXT PRIMARY KEY,
        githubUrl TEXT,
        name TEXT,
        author TEXT,
        description TEXT,
        codiconIcon TEXT,
        logoUrl TEXT,
        category TEXT,
        tags TEXT,
        requiresApiKey BOOLEAN,
        readmeContent TEXT,
        llmsInstallationContent TEXT,
        isRecommended BOOLEAN,
        githubStars INTEGER,
        createdAt TEXT,
        updatedAt TEXT,
        lastGithubSync TEXT,
        FOREIGN KEY (mcpId) REFERENCES services (mcpId)
    )`);
});

// Limit the number of concurrent requests
const limit = pLimit(20); // For example, limit to 20 concurrent requests

const saveMcpServices = async () => {
    // 1. Save the official MCP service list and details
    try {
        // Get the official MCP service list
        const response = await axios.get('https://api.cline.bot/v1/mcp/marketplace'); // Replace with the actual API URL
        const services = response.data;

        // No need to clear tables as we've deleted the entire database file

        let savedServicesCount = 0; // Counter for services
        let savedDetailsCount = 0; // Counter for details

        // Save services data using the same approach as service_details
        const servicePromises = services.map(service =>
            limit(async () => {
                return new Promise((resolve, reject) => {
                    db.run(
                        `INSERT OR REPLACE INTO services (mcpId, name, description, author, githubUrl, logoUrl, category, tags, requiresApiKey, isRecommended, githubStars, downloadCount, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [service.mcpId, service.name, service.description, service.author, service.githubUrl, service.logoUrl, service.category, JSON.stringify(service.tags), service.requiresApiKey, service.isRecommended, service.githubStars, service.downloadCount, service.createdAt, service.updatedAt, 0],
                        function(err) {
                            if (err) {
                                console.error(`Error saving service (mcpId: ${service.mcpId}):`, err);
                                reject(err);
                            } else {
                                console.log(`Saved MCP service: mcpId = ${service.mcpId}, name = ${service.name}`);
                                savedServicesCount++;
                                resolve();
                            }
                        }
                    );
                });
            })
        );

        await Promise.all(servicePromises);
        console.log(`Total of ${savedServicesCount} MCP services saved to the database.`);

        // Get service details and save to service_details table
        const detailsPromises = services.map(service =>
            limit(async () => {
                try {
                    const detailResponse = await axios.get(`https://api.cline.bot/v1/mcp/marketplace/item?mcpId=${service.mcpId}`); // Replace with the actual API URL
                    const detail = detailResponse.data;

                    // Save service details to SQLite database
                    db.run(`INSERT OR REPLACE INTO service_details (mcpId, githubUrl, name, author, description, codiconIcon, logoUrl, category, tags, requiresApiKey, readmeContent, llmsInstallationContent, isRecommended, githubStars, createdAt, updatedAt, lastGithubSync) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [detail.mcpId, detail.githubUrl, detail.name, detail.author, detail.description, detail.codiconIcon, detail.logoUrl, detail.category, JSON.stringify(detail.tags), detail.requiresApiKey, detail.readmeContent, detail.llmsInstallationContent, detail.isRecommended, detail.githubStars, detail.createdAt, detail.updatedAt, detail.lastGithubSync]);

                    savedDetailsCount++; // Increment counter for each saved detail
                } catch (error) {
                    console.error(`Error getting service details (mcpId: ${service.mcpId}):`, error); // Log error but do not affect other requests
                }
            })
        );

        await Promise.all(detailsPromises);
        console.log(`Total of ${savedDetailsCount} MCP service details saved successfully.`); // Output the number of saved details
    } catch (error) {
        console.error('Error saving MCP services:', error);
    } finally {
        // Close database connection
        db.close(err => {
            if (err) {
              console.error("Error closing database:", err);
            } else {
              console.log("Database connection closed");
            }
        });
    }
};

saveMcpServices();
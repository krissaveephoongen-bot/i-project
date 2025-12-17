/**
 * S-Curve PDF Export Service
 * Generates professional PDF reports with S-Curve visualization
 */

const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { executeQuery } = require('../database/neon-connection');
const { calculateSCurve } = require('./sCurveService');

/**
 * Generate S-Curve PDF report
 * @param {number} projectId
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateSCurvePdf(projectId) {
  try {
    // Get S-Curve data
    const sCurveData = await calculateSCurve(projectId);

    // Create PDF document
    const doc = new PDFDocument({
      bufferPages: true,
      margin: 50
    });

    // Buffer to collect PDF
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Add content
    addHeader(doc, sCurveData);
    addSummary(doc, sCurveData);
    await addChart(doc, sCurveData);
    addMetrics(doc, sCurveData);
    addTaskBreakdown(doc, sCurveData);
    addFooter(doc);

    // Finalize PDF
    doc.end();

    // Return PDF as buffer
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
    });
  } catch (error) {
    console.error('❌ PDF generation error:', error.message);
    throw error;
  }
}

/**
 * Add header section
 */
function addHeader(doc, data) {
  doc.fontSize(24).font('Helvetica-Bold').text('S-Curve Project Report', {
    align: 'center'
  });

  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(data.projectName, {
    align: 'center'
  });

  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#666').text(
    `Generated: ${new Date().toLocaleDateString()} | Project Duration: ${formatDate(
      data.startDate
    )} to ${formatDate(data.endDate)}`,
    {
      align: 'center'
    }
  );

  doc.fillColor('#000').moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
}

/**
 * Add summary section
 */
function addSummary(doc, data) {
  doc.fontSize(14).font('Helvetica-Bold').text('Project Summary', {
    underline: true
  });

  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');

  const summaryItems = [
    {
      label: 'Overall Progress',
      value: `${data.actualPercentage.toFixed(1)}%`
    },
    {
      label: 'Planned Progress',
      value: `${data.plannedPercentage.toFixed(1)}%`
    },
    {
      label: 'Variance',
      value: `${data.variance >= 0 ? '+' : ''}${data.variance.toFixed(1)}%`
    },
    {
      label: 'Status',
      value: data.summary.performanceStatus
    },
    {
      label: 'Tasks Completed',
      value: `${data.completedTasks} of ${data.totalTasks}`
    },
    {
      label: 'Total Weight',
      value: `${data.totalWeight.toFixed(1)}`
    }
  ];

  summaryItems.forEach((item) => {
    doc.fontSize(10).font('Helvetica').text(`${item.label}:`, { continued: true });
    doc.font('Helvetica-Bold').text(` ${item.value}`);
  });

  doc.moveDown(1);
}

/**
 * Add S-Curve chart
 */
async function addChart(doc, data) {
  doc.fontSize(14).font('Helvetica-Bold').text('Progress Chart', {
    underline: true
  });

  doc.moveDown(0.5);

  try {
    // Create chart using ChartJS
    const chartConfig = {
      type: 'line',
      data: {
        labels: data.data.map((d) => d.month),
        datasets: [
          {
            label: 'Planned Progress',
            data: data.data.map((d) => d.plannedPercentage),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: 'Actual Progress',
            data: data.data.map((d) => d.actualPercentage),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Progress (%)'
            }
          }
        }
      }
    };

    // Generate chart image
    const canvasRender = new ChartJSNodeCanvas({
      width: 500,
      height: 300
    });
    const image = await canvasRender.renderToBuffer(chartConfig);

    // Add chart image to PDF
    doc.image(image, {
      width: 450,
      align: 'center'
    });
  } catch (error) {
    // Fallback if chart generation fails
    doc.fontSize(10).text('(Chart visualization pending)', {
      color: '#999'
    });
  }

  doc.moveDown(1);
}

/**
 * Add metrics section
 */
function addMetrics(doc, data) {
  doc.fontSize(14).font('Helvetica-Bold').text('Performance Metrics', {
    underline: true
  });

  doc.moveDown(0.5);

  // Status indicator
  const statusColor = data.summary.onTrack ? '#10b981' : '#ef4444';
  const statusBg = data.summary.onTrack ? '#d1fae5' : '#fee2e2';

  // Create metric boxes
  const metrics = [
    {
      title: 'Current Status',
      value: data.summary.performanceStatus,
      color: statusColor,
      bg: statusBg
    },
    {
      title: 'Days Variance',
      value: `${data.summary.daysVariance} days`,
      color: '#6366f1',
      bg: '#e0e7ff'
    },
    {
      title: 'Completion Rate',
      value: `${((data.completedTasks / data.totalTasks) * 100).toFixed(1)}%`,
      color: '#f59e0b',
      bg: '#fef3c7'
    }
  ];

  metrics.forEach((metric, idx) => {
    if (idx > 0) doc.moveDown(0.5);

    doc.rect(50, doc.y, 480, 50).fill(metric.bg);
    doc.fillColor(metric.color).fontSize(10).font('Helvetica-Bold').text(`${metric.title}:`, 60, doc.y + 12);
    doc.fontSize(16).font('Helvetica-Bold').text(metric.value, 60, doc.y - 5);
  });

  doc.fillColor('#000').moveDown(2);
}

/**
 * Add task breakdown section
 */
async function addTaskBreakdown(doc, data) {
  doc.fontSize(14).font('Helvetica-Bold').text('Task Summary', {
    underline: true
  });

  doc.moveDown(0.5);

  try {
    // Fetch tasks for breakdown
    const tasksResult = await executeQuery(
      'SELECT name, status, weight FROM tasks WHERE project_id = $1 AND is_deleted = false ORDER BY status, name LIMIT 10',
      [data.projectId]
    );

    const tasks = tasksResult.rows;

    if (tasks.length === 0) {
      doc.fontSize(10).text('No tasks found');
      doc.moveDown(1);
      return;
    }

    // Create table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Task Name', 50, doc.y, { width: 300 });
    doc.text('Status', 360, doc.y - 10, { width: 100 });
    doc.text('Weight', 475, doc.y - 10, { width: 60 });

    doc.moveDown(0.5);
    doc.stroke();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Add table rows
    doc.fontSize(9).font('Helvetica');
    tasks.slice(0, 10).forEach((task) => {
      const statusColor =
        task.status === 'completed'
          ? '#10b981'
          : task.status === 'in_progress'
            ? '#f59e0b'
            : '#6b7280';

      doc.text(task.name.substring(0, 40), 50, doc.y, { width: 300 });
      doc.fillColor(statusColor).text(task.status, 360, doc.y - 10, { width: 100 });
      doc.fillColor('#000').text((task.weight || 1).toFixed(1), 475, doc.y - 10, {
        width: 60
      });
      doc.moveDown(0.4);
    });

    if (tasks.length > 10) {
      doc.fontSize(9).fillColor('#666').text(`... and ${tasks.length - 10} more tasks`);
    }
  } catch (error) {
    console.error('Error fetching task breakdown:', error.message);
    doc.fontSize(10).text('(Unable to load task details)');
  }

  doc.moveDown(1);
}

/**
 * Add footer
 */
function addFooter(doc) {
  doc.fontSize(9).fillColor('#999');
  doc.moveTo(50, doc.page.height - 50).lineTo(550, doc.page.height - 50).stroke();
  doc.text(
    `S-Curve Report | Page 1 of 1 | ${new Date().toLocaleString()}`,
    50,
    doc.page.height - 40,
    { align: 'center' }
  );
}

/**
 * Format date
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

module.exports = {
  generateSCurvePdf
};

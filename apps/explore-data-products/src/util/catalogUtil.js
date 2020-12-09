/* eslint-disable import/prefer-default-export */
import JSPDF from 'jspdf';
import moment from 'moment';
import camelCase from 'lodash/camelCase';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import {
  FILTER_KEYS,
  FILTER_LABELS,
  SORT_METHODS,
  VISUALIZATIONS,
} from './filterUtil';

/**
 Payload Columns

 We don't export all state data and particular fields in the catalog download
 warrant more public-facing naming. This data structure defines all the fields we
 expect to see in a catalog download. Only used for JSON and CSV because PDF
 generation has a more complex layout.
 Column attributes:

  * label <string>
    Field label as it should appear in CSV/PDF. Will be camelCased for JSON.
  * value <string|function>
    If string: key name in product to use as field value. If function: take product
    as only argument and return appropriate field value.
  * formats <array>
    List of string extensions where the column should appear
  * escape <boolean>
    Whether the field's value may contain a comma and therefore be quoted/escaped in CSV
*/
const payloadColumns = [
  {
    label: 'Product ID',
    value: 'productCode',
    formats: ['csv', 'json'],
  },
  {
    label: 'Level',
    value: (product) => product.productCode.substr(2, 1),
    formats: ['csv', 'json'],
  },
  {
    label: 'Name',
    value: 'productName',
    formats: ['csv', 'json'],
    escape: true,
  },
  {
    label: 'Status',
    value: (product) => product.filterableValues.DATA_STATUS,
    formats: ['csv', 'json'],
  },
  {
    label: 'URL',
    value: (product) => `${NeonEnvironment.getHost()}/data-products/${product.productCode}`,
    formats: ['csv', 'json'],
  },
  {
    label: 'First Available Month',
    value: (product) => (
      product.filterableValues.DATE_RANGE.length ? product.filterableValues.DATE_RANGE[0] : ''
    ),
    formats: ['csv', 'json'],
  },
  {
    label: 'Latest Available Month',
    value: (product) => (
      product.filterableValues.DATE_RANGE.length
        ? product.filterableValues.DATE_RANGE[product.filterableValues.DATE_RANGE.length - 1]
        : ''
    ),
    formats: ['csv', 'json'],
  },
  {
    label: 'Science Team',
    value: 'productScienceTeam',
    formats: ['csv', 'json'],
    escape: true,
  },
  {
    label: 'Description',
    value: 'productDescription',
    formats: ['csv', 'json'],
    escape: true,
  },
  {
    label: 'Keywords',
    value: 'keywords',
    formats: ['json'],
  },
];

// Helper function to format a list of strings into a comma separated list with an oxford comma
// and an "and", as necessary. Strings passed to this function are a no-op.
const orList = (list) => {
  if (typeof list === 'string') { return list; }
  switch (list.length) {
    case 0:
      return '';
    case 1:
      return list[0];
    case 2:
      return `${list[0]} or ${list[1]}`;
    default:
      return `${list.slice(0, list.length - 1).join(', ')}, or ${list[list.length - 1]}`;
  }
};

const generateProductIDList = (products, productOrder, filtered = false) => {
  if (filtered) { return [...productOrder]; }
  const list = Object.keys(products);
  list.sort((a, b) => (
    products[a].productName.toUpperCase() < products[b].productName.toUpperCase() ? -1 : 1
  ));
  return list;
};

const generateCsv = (products, productOrder, filtered = false) => {
  const rows = [payloadColumns.map((column) => column.label).join(',')];
  const orderedList = generateProductIDList(products, productOrder, filtered);
  orderedList.forEach((productCode) => {
    const row = payloadColumns
      .filter((column) => column.formats.includes('csv'))
      .map((column) => {
        let value = typeof column.value === 'function'
          ? column.value(products[productCode])
          : products[productCode][column.value];
        if (column.escape) { value = `"${value.replace('"', '\\"')}"`; }
        return value;
      });
    rows.push(row.join(','));
  });
  return rows.join('\n');
};

const generateJson = (products, productOrder, filtered = false) => {
  const orderedList = generateProductIDList(products, productOrder, filtered);
  const productList = orderedList.map((productCode) => {
    const product = {};
    payloadColumns
      .filter((column) => column.formats.includes('json'))
      .forEach((column) => {
        const key = camelCase(column.label);
        const value = typeof column.value === 'function'
          ? column.value(products[productCode])
          : products[productCode][column.value];
        product[key] = value;
      });
    return product;
  });
  return JSON.stringify({ products: productList });
};

const generatePdf = (
  products,
  productOrder,
  filtersApplied = [],
  filterValues = {},
  sortMethod = null,
  sortDirection = null,
  search,
  statesJSON,
) => {
  const formatFilterContent = (key) => {
    if (!FILTER_KEYS[key]) { return ''; }
    switch (key) {
      case FILTER_KEYS.SEARCH:
        return search;
      case FILTER_KEYS.DATE_RANGE:
        return `Any data available from ${filterValues[key][0]} through ${filterValues[key][1]}`;
      case FILTER_KEYS.SITES:
      case FILTER_KEYS.DOMAINS:
        return `Data available from ${orList(filterValues[key])}`;
      case FILTER_KEYS.STATES:
        return `Data available from ${orList(filterValues[key].map((abb) => (statesJSON[abb].name || abb)))}`;
      case FILTER_KEYS.VISUALIZATIONS:
        return `Can be visualized by ${orList(filterValues[key].map((viz) => (VISUALIZATIONS[viz].name || viz)))}`;
      default:
        return orList(filterValues[key]);
    }
  };
  const filtered = filtersApplied.length > 0;
  const productList = generateProductIDList(products, productOrder, filtered);
  // PDF layout constants (in inches)
  const margin = 0.75;
  const pageWidth = 8.5;
  const pageHeight = 11;
  // vertical baseline-to-baseline at 11pt font size for multi-line text like descriptions
  const lineHeight = 0.17;
  // vertical baseline-to-baseline at 11pt font size for a block-level element
  const blockLineHeight = 0.22;
  // height from hr to description (title and catalog data except description, including spacing)
  const baseProductHeight = 1.15;
  // Document Setup
  const pdf = new JSPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
  pdf.setTextColor('#000000');
  pdf.setFont('helvetica', 'normal');
  // Document Title
  pdf.setFontSize(18);
  pdf.text(
    `NEON Data Product Catalog (${filtered ? 'Filtered Subset' : 'All Products'})`,
    margin,
    margin,
  );
  pdf.setFontSize(11);
  // Catalog Info
  let y = 1.05;
  let sort = 'by Product Name, ascending';
  const filtersAppliedByLabelWidth = [...filtersApplied.filter((key) => FILTER_KEYS[key])];
  filtersAppliedByLabelWidth.sort((a, b) => {
    const aWidth = pdf.getTextWidth(FILTER_LABELS[a]);
    const bWidth = pdf.getTextWidth(FILTER_LABELS[b]);
    if (aWidth === bWidth) { return a < b ? -1 : 1; }
    return aWidth <= bWidth ? 1 : -1;
  });
  const filterLabelWidth = filtered
    ? Math.max(pdf.getTextWidth(FILTER_LABELS[filtersAppliedByLabelWidth[0]]) + 0.2, 0.88)
    : 0.88;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Generated:', margin, y);
  pdf.text('Product Count:', margin + filterLabelWidth + 1.07, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(moment().format('YYYY-MM-DD'), margin + filterLabelWidth, y);
  if (!filtered) {
    pdf.text(`${Object.keys(products).length} (full catalog)`, margin + filterLabelWidth + 2.27, y);
  } else {
    pdf.text(
      `${productList.length} (filtered from full catalog of ${Object.keys(products).length})`,
      margin + filterLabelWidth + 2.27,
      y,
    );
    y += blockLineHeight * 1.5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12.5);
    pdf.text('Filters and Sorting', margin, y);
    pdf.setFontSize(11);
    y += blockLineHeight * 0.5;
    filtersAppliedByLabelWidth.forEach((key) => {
      const filterLabel = FILTER_LABELS[key];
      const filterContent = formatFilterContent(key);
      const splitFilterContent = filterContent.length
        ? pdf.splitTextToSize(filterContent, pageWidth - (2 * margin) - filterLabelWidth)
        : [''];
      y += blockLineHeight;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${filterLabel}:`, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(splitFilterContent, margin + filterLabelWidth, y);
      y += (splitFilterContent.length - 1) * lineHeight;
    });
    const { label } = SORT_METHODS[sortMethod];
    sort = `${label}, ${sortDirection === 'ASC' ? 'ascending' : 'descending'}`;
  }
  y += blockLineHeight;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sort:', margin, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(sort, margin + filterLabelWidth, y);
  y += blockLineHeight;
  // Loop through products
  productList.forEach((productCode) => {
    const product = products[productCode];
    const splitDescription = pdf.splitTextToSize(
      product.productDescription,
      pageWidth - (2 * margin),
    );
    const productHeight = baseProductHeight
      + (lineHeight * splitDescription.length)
      + (1.5 * lineHeight);
    // Draw divider or new page, never both
    if (y + productHeight + margin > pageHeight) {
      pdf.addPage();
      y = margin;
    } else {
      pdf.setFillColor(Theme.palette.grey[300]);
      pdf.rect(margin, y, pageWidth - (2 * margin), 0.002, 'F');
      pdf.setFillColor('#000000');
    }
    let offset = 0.3;
    // Render product name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12.5);
    pdf.setTextColor(Theme.palette.primary.main);
    pdf.text(product.productName, margin, y + offset);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor('#000000');
    // Render product ID and URL
    offset += 0.28;
    pdf.setFont('helvetica', 'bold');
    pdf.text('ID:', margin, y + offset);
    pdf.setFont('helvetica', 'normal');
    pdf.text(productCode, margin + 0.25, y + offset);
    const url = `${NeonEnvironment.getHost()}/data-products/${productCode}`;
    pdf.setFont('helvetica', 'bold');
    pdf.text('URL:', margin + 1.5, y + offset);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(Theme.palette.secondary.light);
    pdf.textWithLink(url, margin + 1.95, y + offset, { url });
    pdf.setTextColor('#000000');
    // Render Level, Status, and Availability
    offset += blockLineHeight;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Level:', margin, y + offset);
    pdf.setFont('helvetica', 'normal');
    pdf.text(product.productCode.substr(2, 1), margin + 0.5, y + offset);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Status:', margin + 1.5, y + offset);
    pdf.setFont('helvetica', 'normal');
    pdf.text(product.filterableValues.DATA_STATUS, margin + 2.1, y + offset);
    if (product.filterableValues.DATA_STATUS === 'Available') {
      const rangeStart = product.filterableValues.DATE_RANGE[0];
      const rangeLength = product.filterableValues.DATE_RANGE.length;
      const rangeEnd = product.filterableValues.DATE_RANGE[rangeLength - 1];
      const available = `${rangeStart} through ${rangeEnd}`;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data Available:', margin + 3.1, y + offset);
      pdf.setFont('helvetica', 'normal');
      pdf.text(available, margin + 4.28, y + offset);
    }
    // Render Science Team
    offset += blockLineHeight;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Science Team:', margin, y + offset);
    pdf.setFont('helvetica', 'normal');
    pdf.text(product.productScienceTeam, margin + 1.15, y + offset);
    // Render Description
    offset += 0.3;
    pdf.text(splitDescription, margin, y + offset);
    // Final y-adjustment for this product
    y += productHeight;
  });
  return pdf;
};

export const downloadCatalog = (
  products,
  productOrder,
  ext = 'csv',
  filtersApplied = [],
  filterValues = {},
  sortMethod = null,
  sortDirection = null,
  search = '',
  statesJSON,
) => {
  const filtered = filtersApplied.length > 0;
  let payload = '';
  let mimeType = '';
  const fileName = `NEON_Data_Product_Catalog_${filtered ? 'FILTERED' : 'ALL_PRODUCTS'}.${ext}`;
  switch (ext) {
    case 'csv':
      payload = generateCsv(products, productOrder, filtered);
      mimeType = 'text/csv;charset=utf-8';
      break;
    case 'json':
      payload = generateJson(products, productOrder, filtered);
      mimeType = 'application/json;charset=utf-8';
      break;
    case 'pdf':
      payload = generatePdf(
        products,
        productOrder,
        filtersApplied,
        filterValues,
        sortMethod,
        sortDirection,
        search,
        statesJSON,
      );
      payload.save(fileName);
      return;
    default:
      break;
  }
  if (!payload.length) { return; }
  if (navigator.msSaveBlob) { // IE10+
    navigator.msSaveBlob(new Blob([payload], { type: mimeType }), fileName);
  } else {
    const link = document.createElement('a');
    if (URL) {
      link.href = URL.createObjectURL(new Blob([payload], { type: mimeType }));
    } else {
      link.setAttribute('href', `data:${mimeType},${encodeURI(payload)}`);
    }
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

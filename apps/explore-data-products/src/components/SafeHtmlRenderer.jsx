import React from 'react';
import PropTypes from 'prop-types';

/**
 * A safer component that renders HTML content without using dangerouslySetInnerHTML
 * @param {string} htmlContent - The HTML content to render
 * @param {Array} allowedTags - Array of allowed HTML tags (default: ['a', 'strong', 'em', 'br'])
 */
const SafeHtmlRendererV2 = ({ htmlContent, allowedTags = ['a', 'strong', 'em', 'br'] }) => {
  // Parse HTML and convert to React elements
  const parseHtmlToReact = (html) => {
    if (!html) return null;

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Function to convert DOM nodes to React elements
    const nodeToReact = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        if (allowedTags.includes(tagName)) {
          const props = {};

          // Handle specific attributes for allowed tags
          if (tagName === 'a') {
            const href = node.getAttribute('href');
            const target = node.getAttribute('target');
            if (href) props.href = href;
            if (target) props.target = target;
            // Add rel="noopener noreferrer" for security
            props.rel = 'noopener noreferrer';
          }

          // Process child nodes
          const children = Array.from(node.childNodes).map(nodeToReact).filter(Boolean);

          return React.createElement(tagName, props, ...children);
        }
        // For disallowed tags, just return the text content
        return node.textContent;
      }

      return null;
    };

    // Convert all child nodes
    const reactElements = Array.from(tempDiv.childNodes)
      .map(nodeToReact)
      .filter(Boolean);

    return reactElements.length > 0 ? reactElements : null;
  };

  const reactElements = parseHtmlToReact(htmlContent);

  return (
    <div
      style={{
        maxWidth: '300px',
        lineHeight: '1.4',
      }}
    >
      {reactElements}
    </div>
  );
};

SafeHtmlRendererV2.propTypes = {
  htmlContent: PropTypes.string.isRequired,
  allowedTags: PropTypes.arrayOf(PropTypes.string),
};

SafeHtmlRendererV2.defaultProps = {
  allowedTags: ['a', 'strong', 'em', 'br'],
};

export default SafeHtmlRendererV2;

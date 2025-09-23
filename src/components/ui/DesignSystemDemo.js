import React from 'react';

const DesignSystemDemo = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Design System Demo</h1>
        <p className="text-gray-600">Global styling system for consistent UI components</p>
      </div>

      {/* Form Fields Demo */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Form Fields</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label htmlFor="standard-input" className="form-label">Standard Input</label>
            <input 
              id="standard-input"
              type="text" 
              className="form-input" 
              placeholder="Enter text here..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="error-input" className="form-label">Input with Error</label>
            <input 
              id="error-input"
              type="text" 
              className="form-input error" 
              placeholder="This field has an error"
            />
            <p className="form-error">This field is required</p>
          </div>

          <div className="form-group">
            <label htmlFor="help-input" className="form-label">Input with Help Text</label>
            <input 
              id="help-input"
              type="text" 
              className="form-input" 
              placeholder="Enter your username"
            />
            <p className="form-help">Username must be at least 3 characters long</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first-name" className="form-label">First Name</label>
              <input 
                id="first-name"
                type="text" 
                className="form-input" 
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last-name" className="form-label">Last Name</label>
              <input 
                id="last-name"
                type="text" 
                className="form-input" 
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="select-dropdown" className="form-label">Select Dropdown</label>
            <select id="select-dropdown" className="form-select">
              <option>Choose an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="textarea-input" className="form-label">Textarea</label>
            <textarea 
              id="textarea-input"
              className="form-textarea" 
              placeholder="Enter your message here..."
            ></textarea>
          </div>

          <div className="form-group">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm text-gray-700">Checkbox option</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="radio" className="form-radio" />
                <span className="ml-2 text-sm text-gray-700">Radio option</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Demo */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Buttons</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Button Variants</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-outline">Outline Button</button>
              <button className="btn btn-ghost">Ghost Button</button>
              <button className="btn btn-danger">Danger Button</button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary">Medium</button>
              <button className="btn btn-primary btn-lg">Large</button>
              <button className="btn btn-primary btn-xl">Extra Large</button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Full Width Button</h3>
            <button className="btn btn-primary btn-full">Full Width Button</button>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Disabled State</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary" disabled>Disabled Primary</button>
              <button className="btn btn-secondary" disabled>Disabled Secondary</button>
            </div>
          </div>
        </div>
      </div>

      {/* Border Radius Demo */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Border Radius</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-100 rounded-global-sm text-center">
              <p className="text-sm font-medium">Small</p>
              <p className="text-xs text-gray-600">rounded-global-sm</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-global text-center">
              <p className="text-sm font-medium">Medium</p>
              <p className="text-xs text-gray-600">rounded-global</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-global-lg text-center">
              <p className="text-sm font-medium">Large</p>
              <p className="text-xs text-gray-600">rounded-global-lg</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-global-xl text-center">
              <p className="text-sm font-medium">Extra Large</p>
              <p className="text-xs text-gray-600">rounded-global-xl</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Demo */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Card with Header</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-600">This is a card with header and body sections.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold mb-2">Simple Card</h3>
            <p className="text-gray-600">This is a simple card with just body content.</p>
          </div>
          <div className="card-footer">
            <button className="btn btn-primary btn-sm">Action</button>
          </div>
        </div>
      </div>

      {/* Glassmorphism Demo */}
      <div className="relative p-8 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-global-xl">
        <div className="glass p-6 rounded-global-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Glassmorphism Effect</h3>
          <p className="text-white/90">This demonstrates the glassmorphism styling with backdrop blur and transparency.</p>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemDemo;

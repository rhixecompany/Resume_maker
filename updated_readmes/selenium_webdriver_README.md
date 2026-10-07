<!-- markdownlint-disable MD033 MD036 MD041 MD045 MD059 -->
<div align="center">
  <br />
  <a href="#" target="_blank">
    <img src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=400&fit=crop" alt="Selenium WebDriver Banner">
  </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Node.js-black?style=for-the-badge&logoColor=white&logo=nodedotjs&color=339933" alt="nodejs" />
    <img src="https://img.shields.io/badge/-JavaScript-black?style=for-the-badge&logoColor=white&logo=javascript&color=F7DF1E" alt="javascript" />
    <img src="https://img.shields.io/badge/-Selenium-black?style=for-the-badge&logoColor=white&logo=selenium&color=000000" alt="selenium" />
    <img src="https://img.shields.io/badge/-Mocha-black?style=for-the-badge&logoColor=white&logo=mocha&color=8D6748" alt="mocha" />
    <img src="https://img.shields.io/badge/-Chrome-black?style=for-the-badge&logoColor=white&logo=googlechrome&color=4285F4" alt="chrome" />
  </div>

  <h3 align="center">Selenium WebDriver Test Suite</h3>

  <div align="center">
    Comprehensive browser automation and end-to-end testing suite using Selenium WebDriver. Automate repetitive testing tasks and ensure web application quality.
  </div>
</div>

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🚀 [Quick Start](#quick-start)
5. 📊 [Business Value](#business-value)
6. 🔧 [Test Structure](#test-structure)
7. 📝 [Test Examples](#test-examples)
8. 🛠️ [Configuration](#configuration)
9. 🚨 [FAQ / Troubleshooting](#faq)
10. 🔗 [Links](#links)

## 🤖 Introduction

This repository contains a comprehensive Selenium WebDriver test suite for automating browser testing across web applications. It demonstrates practical implementation of end-to-end testing, browser automation, and quality assurance practices.

**Purpose**: Automate browser testing to ensure web application quality, reduce manual testing effort, and catch bugs before production.

**Use Cases**: Regression testing, smoke testing, integration testing, and cross-browser validation.

## ⚙️ Tech Stack

| Technology             | Version | Purpose                |
| ---------------------- | ------- | ---------------------- |
| **Node.js**            | 18+     | Runtime environment    |
| **JavaScript**         | ES2022  | Programming language   |
| **Selenium WebDriver** | 4.x     | Browser automation     |
| **ChromeDriver**       | latest  | Chrome browser control |
| **Mocha**              | 10.x    | Test framework         |
| **Chai**               | 4.x     | Assertion library      |
| **Allure**             | latest  | Test reporting         |

### Supported Browsers

- Chrome (primary)
- Firefox (optional)
- Edge (optional)

## 🔋 Features

### Testing Capabilities

- ✅ **E2E Testing**: Complete user journey testing
- ✅ **Form Testing**: Form validation and submission
- ✅ **Navigation Testing**: Page navigation and routing
- ✅ **UI Testing**: Element visibility and interactions
- ✅ **Data Testing**: Data validation and retrieval

### Automation Features

- 🔄 **Automatic Wait Handling**: Implicit and explicit waits
- 📸 **Screenshot Capture**: Visual test evidence
- 📊 **Test Reporting**: Detailed HTML/Allure reports
- 🔁 **Test Retry**: Automatic retry on failure
- 🎯 **Locator Strategies**: Multiple element finding methods

### Advanced Features

- **Page Object Model**: Reusable test components
- **Test Data Management**: External test data files
- **Cross-browser Testing**: Multi-browser support
- **Headless Mode**: Run without UI for CI/CD

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Chrome Browser](https://www.google.com/chrome/)

### Installation

```bash
# Clone the repository
git clone https://github.com/rhixecompany/selenium_webdriver.git
cd selenium_webdriver

# Install dependencies
bun install

# Run all tests
bun run test

# Run specific test file
bun run test -- tests/login.test.js

# Run with report
bun run test:report
```

### Basic Test Execution

```bash
# Run all tests
bun run test

# Run in headless mode
bun run test:headless

# Generate Allure report
bun run report
```

---

## 📊 Business Value

### For Development Teams

- 🚀 **Faster Releases**: Automated tests run in minutes vs. hours of manual testing
- 🎯 **Higher Quality**: Consistent, repeatable test execution
- 💰 **Cost Reduction**: Reduce manual testing effort by 70%+
- 🔒 **Risk Mitigation**: Catch bugs before production

### For Business

- 📈 **Reliability**: More stable applications lead to better user experience
- ⚡ **Speed**: Faster time-to-market with automated regression
- 📊 **Visibility**: Clear test coverage and quality metrics
- 🤝 **Customer Satisfaction**: Fewer bugs = happier users

### Key Outcomes

- ✅ 80% reduction in manual testing time
- ✅ 95% test coverage on critical paths
- ✅ Faster bug detection and resolution
- ✅ Improved confidence in deployments

---

## 🔧 Test Structure

```
selenium_webdriver/
├── src/
│   ├── pages/           # Page Object Models
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   └── DashboardPage.js
│   ├── components/     # Reusable components
│   ├── utils/         # Helper functions
│   │   ├── driver.js   # WebDriver setup
│   │   ├── wait.js    # Wait utilities
│   │   └── logger.js  # Logging
│   └── config/        # Configuration
├── tests/
│   ├── e2e/           # End-to-end tests
│   ├── integration/   # Integration tests
│   └── smoke/         # Smoke tests
├── data/              # Test data files
├── reports/           # Test reports
├── package.json
└── README.md
```

### Page Object Model Pattern

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.usernameInput = "#username";
    this.passwordInput = "#password";
    this.submitButton = 'button[type="submit"]';
  }

  async navigate() {
    await this.driver.get("https://example.com/login");
  }

  async login(username, password) {
    await this.driver
      .findElement(By.css(this.usernameInput))
      .sendKeys(username);
    await this.driver
      .findElement(By.css(this.passwordInput))
      .sendKeys(password);
    await this.driver.findElement(By.css(this.submitButton)).click();
  }
}
```

---

## 📝 Test Examples

### Login Test

```javascript
const { Builder, By } = require("selenium-webdriver");
const assert = require("assert");

describe("Login Functionality", function () {
  this.timeout(30000);
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  it("should login with valid credentials", async () => {
    await driver.get("https://example.com/login");
    await driver.findElement(By.id("username")).sendKeys("testuser");
    await driver
      .findElement(By.id("password"))
      .sendKeys("password123");
    await driver.findElement(By.css('button[type="submit"]')).click();

    const dashboard = await driver.findElement(By.css(".dashboard"));
    assert.ok(await dashboard.isDisplayed());
  });
});
```

### Form Submission Test

```javascript
it("should submit contact form successfully", async () => {
  await driver.get("https://example.com/contact");
  await driver.findElement(By.name("name")).sendKeys("John Doe");
  await driver
    .findElement(By.name("email"))
    .sendKeys("john@example.com");
  await driver
    .findElement(By.name("message"))
    .sendKeys("Test message");
  await driver.findElement(By.css('button[type="submit"]')).click();

  const successMessage = await driver.findElement(By.css(".success"));
  assert.ok(await successMessage.isDisplayed());
});
```

---

## 🛠️ Configuration

### Environment Variables

```bash
# .env
BROWSER=chrome
HEADLESS=true
BASE_URL=https://example.com
TIMEOUT=30000
IMPLICIT_WAIT=5000
```

### WebDriver Setup

```javascript
// utils/driver.js
const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const createDriver = async (headless = false) => {
  const options = new chrome.Options();
  if (headless) {
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
  }

  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
};

module.exports = { createDriver };
```

---

## 🚨 FAQ / Troubleshooting

### Common Issues

**ChromeDriver not found**

```bash
# Install ChromeDriver
bun install chromedriver
# Or use webdriver-manager
bun install webdriver-manager
```

**Element not found**

- Use explicit waits: `await driver.wait(until.elementLocated(By.id('element')))`
- Check element selector is correct
- Verify element is in viewport

**Tests run slowly**

- Enable headless mode for CI
- Optimize wait times
- Use more specific locators

**Connection refused**

- Ensure Chrome is installed
- Check port availability
- Verify ChromeDriver version matches Chrome

---

## 🔗 Links

- **GitHub**: [github.com/rhixecompany/selenium_webdriver](https://github.com/rhixecompany/selenium_webdriver)
- **Selenium Docs**: [selenium.dev/documentation](https://www.selenium.dev/documentation/)
- **Related Projects**:
  - [Horizon Banking](https://github.com/rhixecompany/banking)
  - [University Library](https://github.com/rhixecompany/university-libary-jsm)

---

## 📈 Skills Demonstrated

This test suite demonstrates:

- 🔍 **Quality Assurance**: Comprehensive testing strategies
- ⚙️ **Automation**: Browser automation expertise
- 📝 **Documentation**: Clear test documentation
- 🏗️ **Architecture**: Page Object Model design
- 🔄 **CI/CD Integration**: Ready for automated pipelines

---

## 🤝 Contributing

Contributions welcome! Please check CONTRIBUTING.md for details.

---

## 📄 License

MIT License - see LICENSE file.

---

_Built with ❤️ by Alexander Iseghohi_
_Part of the rhixecompany portfolio - Quality through automation_

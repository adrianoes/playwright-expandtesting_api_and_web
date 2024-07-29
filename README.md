# playwright-expandtesting_UI_and_API

UI and API testing in [expandtesting](https://practice.expandtesting.com/notes/app/) note app. This project contains basic examples on how to use playwright to test UI, API and how to combine UI and API tests. Good practices such as hooks, custom commands and tags, among others, are used. All the necessary support documentation to develop this project is placed here. When it comes to the API part, it deals with the x-www-form-urlencoded content type. Although custom commands are used, the assertion code to each test is kept in it so we can work independently in each test. It deals with parallel test execution by creating one .json file for each test so we can share data between different requests in the test. The .json file is excluded after each test execution. 

# Pre-requirements:

| Requirement                   | Version | Note                                                            |
| :---------------------------- |:--------| :---------------------------------------------------------------|
| Node.js                       | 18.18.0 | -                                                               |
| npm                           | 10.2.4  | -                                                               |
| Yarn                          | 1.22.19 | Optional.                                                       |
| Playwright                    | 1.44.1  |                                                                 |
| Visual Studio Code            | 1.89.1  | -                                                               |
| Playwright Test for VSCode    | v1.1.7  | Optional. Recommended so you can run tests in VSC.              |                  

# Installation:

- See [Node.js page](https://nodejs.org/en) and install the aforementioned Node.js version. Keep all the preferenced options as they are.
- To use yarn packet manager, open windows prompt as admin and execute ```corepack enable``` (Optional).
- Execute ```npm init playwright@latestt``` to start a project.
  - Hit :point_right:**Enter** to select TypeScript.
  - Hit :point_right:**Enter** to put your end-to-end tests in \tests.
  - Hit :point_right:**y** to add a GitHub Actions workflow.
  - Hit :point_right:**Enter** to install Playwright browsers.
- See [Visual Studio Code page](https://code.visualstudio.com/) and install the latest VSC stable version. Keep all the prefereced options as they are until you reach the possibility to check the checkboxes below: 
  - :white_check_mark: Add "Open with code" action to Windows Explorer file context menu. 
  - :white_check_mark: Add "Open with code" action to Windows Explorer directory context menu.
Check then both to add both options in context menu.
- Look for Playwright Test for VSCode in the extensions marketplace and install the one from Microsoft.
- Execute ```npm install @faker-js/faker --save-dev``` to install faker library.

# Tests:

- Execute ```npx playwright test --ui``` to run your tests with UI Mode. 
- Execute ```npx playwright test``` to execute playwright in headless mode.
- Hit :point_right:**Testing** button on left side bar in VSC and choose the tests you want to execute.

# Support:

- [yarn init documentation page](https://classic.yarnpkg.com/lang/en/docs/cli/init/)
- [expandtesting API documentation page](https://practice.expandtesting.com/notes/api/api-docs/)
- [expandtesting API demonstration page](https://www.youtube.com/watch?v=bQYvS6EEBZc)
- [Faker](https://fakerjs.dev/guide/)
- [Playwright docs](https://playwright.dev/docs/intro)
- [Read/Write JSON Files with Node.js](https://heynode.com/tutorial/readwrite-json-files-nodejs/?utm_source=youtube&utm_medium=referral+&utm_campaign=YT+description&utm_content=read-write-json-iles-with-nodejs)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Use array of keywords and loop through script in Playwright](https://stackoverflow.com/a/69402975/10519428)
- [How to Delete a File From a Directory with Node.js](https://coderrocketfuel.com/article/how-to-delete-a-file-from-a-directory-with-node-js)
- [How to resolve Node.js: "Error: ENOENT: no such file or directory"](https://stackoverflow.com/a/62363729/10519428)
- [trying to click a button on playwright](https://stackoverflow.com/a/71712111/10519428)
- [How to wait for a specific API response in your Playwright end-to-end tests](https://www.youtube.com/watch?v=5CER0dKweyw)
- [How to remove specific character surrounding a string?](https://stackoverflow.com/a/44537491/10519428)

# Tips:

- UI and API tests to send password reset link to user's email and API tests to verify a password reset token and reset a user's password must be tested manually as they rely on e-mail verification.
Feature: View functionality

Scenario: As an admin I should see all buttons in the calendar view
Given: Admins is logged in
And: admin is on the main page
When: I am looking at the calendar view
Then: I should see all buttons

Scenario: As an employee I should not see admin buttons in the calendar view
Given: Employee is logged in
And: employee is on the main page
When: I am looking at the calendar view
Then: I should see limited amount of buttons
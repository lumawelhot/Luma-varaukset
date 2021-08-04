Feature: Employee functionality

Scenario: As an employee I want to log in
  Given Employee is not logged in
  And employee is on the main page
  When I navigate to the login form
  And I enter correct login credentials
  Then I am logged in

Scenario: As an employee I can create an event
  Given Employee is logged in
  And employee is on the main page
  When I navigate to the event form
  And I enter all necessary information
  Then event is successfully created

Scenario: As an employee I want that the events are shown on the calendar view
  Given Employee is logged in
  And employee is on the main page
  When I am looking at the agenda view
  Then events are shown

Scenario: As an employee I want to view visits
  Given Employee is logged in
  And employee is on the main page
  When I navigate to visit list
  Then visits are shown on the page

Scenario: As an employee I want to modify events information
  Given Employee is logged in
  And employee is on the main page
  When I navigate to desired events' page
  And I click modify event button
  And I modify desired fields
  Then event information is modified successfully

Scenario: As an employee I want to create custom fields to the event form
  Given Employee is logged in
  And employee is on the main page
  When I navigate to form field creation page
  And I design new custom fields
  Then the custom form is succesfully created

Scenario: As an employee I want to delete event if it has no visits
  Given Employee is logged in
  And employee is on the main page
  When I navigate to desired events' page
  And I click remove button
  Then event is removed successfully

Scenario: As an employee I cannot delete an event if it has any visits
  Given Employee is logged in
  And employee is on the main page
  When I navigate to booked events' page
  And I click remove button
  Then event is not removed
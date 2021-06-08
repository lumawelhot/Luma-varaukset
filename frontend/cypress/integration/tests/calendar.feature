Feature: Calendar view is shown correctly

Scenario: Bookable visits are shown on the calendar view
    Given Employee is logged in
    And an event with title yyyyy is created
    When I am on the calendar page
    Then the event yyyyy is shown with correct information

Scenario: Bookable visits are visible without login
    Given User is not logged in
    When I am on the calendar page
    Then a specific event is shown
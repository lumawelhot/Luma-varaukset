Feature: As a teacher I want to cancel my booking

Scenario: Event can be booked when booking button is clicked
    Given employee is logged in
    And there is an available event in more than two weeks ahead
    And I have made a booking for that event
    Then I can cancel that booking
    And the event is available for booking
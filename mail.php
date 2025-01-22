<?php
if (isset($_POST['submit'])) {
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : ''; // Corrected to 'email'
    $message = isset($_POST['message']) ? $_POST['message'] : '';

    $to = "kangogojoel25@mail.com";
    $subject = "Mail From website";
    $headers = "From: " . $email . "\r\n";
    $txt = "Name = " . $name . "\r\nEmail = " . $email . "\r\nMessage = " . $message;

    if (!empty($email)) { // Check if email is not empty
        $mailResult = mail($to, $subject, $txt, $headers);
        if ($mailResult) {
            header("Location: thankyou.html?emailsent");
        } else {
            header("Location: error.html"); // Redirect to an error page if mail fails
        }
        exit;
    } else {
        header("Location: error.html"); // Redirect if email is empty
        exit;
    }
}
?>
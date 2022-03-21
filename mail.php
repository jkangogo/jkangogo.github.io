<?php
$name = $_POST['name'];
$email= $_POST['email'];
$message= $_POST['message'];
$to = "kangogojoel25@mail.com";
$subject = "Mail From website";
$txt ="Name = ". $name . "\r\n  Email = " . $email . "\r\n Message =" . $message;
$headers = "From: ".$email;
if($email!=NULL){
    mail($to,$subject,$txt,$headers);
}
//redirect
header("Location:thankyou.html");



if(isset($_POST['submit'])){
    $name = $_POST['name'];
    $email= $_POST['mail'];
    $message= $_POST['message'];

    $to = "kangogojoel25@mail.com";
    $headers = "From: ".$email;
    $txt = "You have received an email from ".$name.".\n\n".$message;

    mail($mailTo, $subject, $txt, $header);
    header("Location: thankyou.html?emailsend");

}
?>
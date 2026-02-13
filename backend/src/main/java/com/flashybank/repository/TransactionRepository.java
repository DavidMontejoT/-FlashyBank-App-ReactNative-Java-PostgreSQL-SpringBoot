package com.flashybank.repository;

import com.flashybank.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    List<Transaction> findByReceiverUsernameOrderByCreatedAtDesc(String receiverUsername);
}

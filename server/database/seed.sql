-- seed.sql
-- Realistic seed data so PrepPilot works immediately after schema setup.
-- Run this AFTER schema.sql:
--   mysql -u root -p preppilot < database/schema.sql
--   mysql -u root -p preppilot < database/seed.sql

USE preppilot;

-- ============================================================
-- QUIZZES
-- ============================================================
INSERT INTO quizzes (level, title) VALUES
  ('Level1', 'PrepPilot Level 1 Assessment'),
  ('Level2', 'PrepPilot Level 2 Assessment');

SET @level1 = (SELECT id FROM quizzes WHERE level = 'Level1');
SET @level2 = (SELECT id FROM quizzes WHERE level = 'Level2');

-- ---- Level 1: Beginner to Intermediate (10 questions) ----
INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, topic) VALUES
(@level1, 'What is the time complexity of binary search on a sorted array?', 'O(n)', 'O(log n)', 'O(n^2)', 'O(1)', 'B', 'Basic DSA'),
(@level1, 'Which SQL clause is used to filter rows before grouping?', 'HAVING', 'WHERE', 'GROUP BY', 'ORDER BY', 'B', 'SQL'),
(@level1, 'What does OOP stand for?', 'Object Oriented Programming', 'Open Operating Protocol', 'Optimized Object Process', 'Object Ordered Protocol', 'A', 'OOPs'),
(@level1, 'Which of the following is a non-primitive data type?', 'int', 'char', 'Array', 'float', 'C', 'Programming Fundamentals'),
(@level1, 'DBMS stands for?', 'Data Base Management System', 'Data Backup Management System', 'Digital Base Management Software', 'Database Backup Method System', 'A', 'DBMS'),
(@level1, 'Which CPU scheduling algorithm is non-preemptive?', 'Round Robin', 'First Come First Serve (FCFS)', 'Shortest Remaining Time First', 'Preemptive Priority', 'B', 'Operating Systems'),
(@level1, 'At which OSI layer does the IP protocol primarily operate?', 'Transport Layer', 'Network Layer', 'Data Link Layer', 'Application Layer', 'B', 'Computer Networks'),
(@level1, 'A + B = B + A demonstrates which mathematical property?', 'Associative', 'Distributive', 'Commutative', 'Identity', 'C', 'Aptitude'),
(@level1, 'If all Cats are Animals, and all Animals are Living Beings, then all Cats are definitely:', 'Plants', 'Living Beings', 'Non-living', 'Cannot be determined', 'B', 'Logical Reasoning'),
(@level1, 'Which data structure follows Last In First Out (LIFO) order?', 'Queue', 'Stack', 'Array', 'Linked List', 'B', 'Basic DSA');

-- ---- Level 2: Advanced (10 questions) ----
INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, topic) VALUES
(@level2, 'What is the time complexity of building a heap from an unsorted array?', 'O(n log n)', 'O(n)', 'O(log n)', 'O(n^2)', 'B', 'Advanced DSA'),
(@level2, 'Which SQL join returns all rows from both tables, with NULLs where there is no match?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'D', 'Advanced SQL'),
(@level2, 'In DBMS, which normal form removes transitive dependency?', '1NF', '2NF', '3NF', 'BCNF', 'C', 'DBMS'),
(@level2, 'Which OOP principle allows a subclass to provide a specific implementation of a method already defined in its superclass?', 'Encapsulation', 'Abstraction', 'Method Overriding', 'Method Overloading', 'C', 'Advanced OOPs'),
(@level2, 'What causes a deadlock in an operating system?', 'High CPU usage', 'Circular wait among processes for resources', 'Low memory', 'Too many threads', 'B', 'Operating Systems'),
(@level2, 'In TCP, what is the purpose of the three-way handshake?', 'Data compression', 'Establishing a reliable connection', 'Encrypting data', 'Load balancing', 'B', 'Computer Networks'),
(@level2, 'Which algorithmic technique does Dynamic Programming rely on?', 'Divide and conquer only', 'Overlapping subproblems and optimal substructure', 'Greedy choice only', 'Backtracking only', 'B', 'Advanced DSA'),
(@level2, 'What is the worst-case time complexity of QuickSort?', 'O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)', 'C', 'Problem Solving'),
(@level2, 'Which SQL keyword is used to remove duplicate rows from a result set?', 'UNIQUE', 'DISTINCT', 'FILTER', 'REMOVE', 'B', 'Advanced SQL'),
(@level2, 'In system design, what is the primary purpose of a load balancer?', 'Store data permanently', 'Distribute incoming traffic across multiple servers', 'Encrypt user passwords', 'Compile source code', 'B', 'Technical Interview Concepts');

-- ============================================================
-- CODING PROBLEMS
-- ============================================================
INSERT INTO coding_problems (title, description, difficulty, topic) VALUES
('Two Sum', 'Given an array of integers and a target, return indices of the two numbers that add up to the target.', 'Easy', 'Arrays'),
('Reverse a String', 'Write a function that reverses a string in place.', 'Easy', 'Strings'),
('Valid Palindrome', 'Given a string, determine if it is a palindrome, considering only alphanumeric characters.', 'Easy', 'Two Pointers'),
('Longest Substring Without Repeating Characters', 'Find the length of the longest substring without repeating characters.', 'Medium', 'Sliding Window'),
('Group Anagrams', 'Group an array of strings into anagram groups.', 'Medium', 'Hashing'),
('Reverse Linked List', 'Reverse a singly linked list.', 'Easy', 'Linked List'),
('Valid Parentheses', 'Determine if a string of brackets is valid (properly opened and closed).', 'Easy', 'Stack'),
('Implement Queue using Stacks', 'Implement a FIFO queue using only two stacks.', 'Easy', 'Queue'),
('Binary Search', 'Implement binary search on a sorted array.', 'Easy', 'Binary Search'),
('Binary Tree Level Order Traversal', 'Return the level order traversal of a binary tree node values.', 'Medium', 'Trees'),
('Number of Islands', 'Count the number of islands in a 2D grid of 1s (land) and 0s (water).', 'Medium', 'Graphs'),
('Longest Common Subsequence', 'Find the length of the longest common subsequence between two strings.', 'Hard', 'Dynamic Programming');

-- ============================================================
-- APTITUDE QUESTIONS
-- ============================================================
INSERT INTO aptitude_questions (category, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
('Quantitative', 'What is 15% of 200?', '20', '30', '25', '35', 'B'),
('Quantitative', 'A train travels 300 km in 5 hours. What is its average speed?', '50 km/h', '60 km/h', '55 km/h', '65 km/h', 'B'),
('Quantitative', 'If the cost price of an item is 400 and it is sold for 500, what is the profit percentage?', '20%', '25%', '15%', '30%', 'B'),
('Logical', 'Find the odd one out: Dog, Cat, Lion, Table', 'Dog', 'Cat', 'Lion', 'Table', 'D'),
('Logical', 'Complete the series: 2, 4, 8, 16, ?', '18', '24', '32', '20', 'C'),
('Logical', 'If FRIEND is coded as HTKGPF, how is CANDLE coded?', 'ECPFNG', 'EBPFNG', 'ECQFNG', 'EBQFNG', 'A'),
('Verbal', 'Choose the correct synonym for Abundant:', 'Scarce', 'Plentiful', 'Rare', 'Limited', 'B'),
('Verbal', 'Choose the correct antonym for Optimistic:', 'Hopeful', 'Positive', 'Pessimistic', 'Confident', 'C'),
('DataInterpretation', 'If a pie chart shows 25% for Category A out of a total of 800 units, how many units does Category A represent?', '150', '200', '250', '100', 'B'),
('DataInterpretation', 'A bar graph shows sales of 120, 150, and 180 units over three months. What is the average monthly sales?', '140', '150', '160', '145', 'B');

-- ============================================================
-- TECHNICAL INTERVIEW RESOURCES
-- ============================================================
INSERT INTO interview_resources (type, topic, question_text, answer_text, difficulty) VALUES
('Technical', 'OOPs', 'What are the four pillars of OOP?', 'Encapsulation (bundling data and methods together), Abstraction (hiding implementation details), Inheritance (reusing behavior from a parent class), and Polymorphism (same interface, different behavior based on the object).', 'Easy'),
('Technical', 'DBMS', 'What is normalization and why is it used?', 'Normalization is the process of organizing database tables to reduce data redundancy and improve data integrity, typically by decomposing tables and defining relationships according to normal forms (1NF, 2NF, 3NF, etc.).', 'Medium'),
('Technical', 'SQL', 'What is the difference between DELETE and TRUNCATE?', 'DELETE removes rows one at a time, can be rolled back, and can use a WHERE clause. TRUNCATE removes all rows at once, is faster, and generally cannot be rolled back in most databases.', 'Easy'),
('Technical', 'OS', 'What is a deadlock and what are its four necessary conditions?', 'A deadlock occurs when a set of processes are blocked because each is holding a resource and waiting for another. The four necessary conditions are: mutual exclusion, hold and wait, no preemption, and circular wait.', 'Medium'),
('Technical', 'CN', 'What is the difference between TCP and UDP?', 'TCP is connection-oriented, reliable, and ensures ordered delivery with error checking. UDP is connectionless, faster, and does not guarantee delivery or order, and is commonly used for streaming and real-time applications.', 'Medium'),
('Technical', 'DSA', 'What is the difference between an array and a linked list?', 'Arrays store elements in contiguous memory with O(1) index access but costly insertions/deletions. Linked lists store elements as nodes with pointers, allowing O(1) insertions/deletions at known positions but O(n) access time.', 'Easy'),
('Technical', 'Java', 'What is the difference between == and .equals() in Java?', '== compares object references (memory addresses) for objects, while .equals() compares the actual content/value of objects, assuming the class has overridden the method appropriately (like String does).', 'Easy'),
('Technical', 'JavaScript', 'What is the difference between let, const, and var?', 'var is function-scoped and hoisted with a default undefined value. let and const are block-scoped; let allows reassignment while const does not allow the variable binding to be reassigned after initialization.', 'Easy'),
('Technical', 'System Design', 'What is the difference between horizontal and vertical scaling?', 'Vertical scaling means adding more resources (CPU/RAM) to a single server. Horizontal scaling means adding more servers/machines to distribute the load, which is generally more resilient but adds architectural complexity.', 'Medium');

-- ============================================================
-- HR INTERVIEW RESOURCES
-- ============================================================
INSERT INTO interview_resources (type, topic, question_text, answer_text, difficulty) VALUES
('HR', 'General', 'Tell me about yourself.', 'Structure your answer as: current situation (what you are studying/doing), relevant background (key skills/projects), and why you are excited about this opportunity. Keep it under 2 minutes and tie it back to the role.', 'Easy'),
('HR', 'General', 'Why should we hire you?', 'Focus on the specific skills and experiences that make you a strong fit for this particular role, backed by a concrete example or achievement, rather than generic traits.', 'Medium'),
('HR', 'General', 'What are your strengths?', 'Pick 2-3 strengths genuinely relevant to the role and back each with a brief, specific example, rather than just listing adjectives.', 'Easy'),
('HR', 'General', 'What are your weaknesses?', 'Choose a real but non-critical weakness, and focus most of your answer on the concrete steps you are taking to improve it.', 'Medium'),
('HR', 'General', 'Why do you want to join our company?', 'Research the company products, values, or recent work, and connect specific things you admire to your own goals and skills.', 'Medium'),
('HR', 'General', 'Where do you see yourself in five years?', 'Show ambition balanced with realism, describing the kind of skills and impact you hope to have grown into, ideally aligned with a plausible path at this company.', 'Medium'),
('HR', 'General', 'Why should we select you over other candidates?', 'Avoid comparing yourself to others directly; instead, reinforce your unique combination of skills, projects, and genuine enthusiasm for the role.', 'Medium');

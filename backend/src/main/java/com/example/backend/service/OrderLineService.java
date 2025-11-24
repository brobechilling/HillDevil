package com.example.backend.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.request.CreateOrderLineRequest;
import com.example.backend.dto.request.UpdateOrderLineStatusRequest;
import com.example.backend.dto.response.UpdateOrderLineStatusResponse;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.OrderLine;
import com.example.backend.entities.OrderLineStatus;
import com.example.backend.entities.OrderStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderItemMapper;
import com.example.backend.mapper.OrderLineMapper;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.OrderLineRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.TableRepository;

import org.slf4j.Logger;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OrderLineService {

    private final OrderLineRepository orderLineRepository;
    private final OrderRepository orderRepository;
    private final OrderLineMapper orderLineMapper;
    private final OrderItemService orderItemService;
    private final TableRepository tableRepository;
    private final BranchRepository branchRepository;
    private Logger logger = org.slf4j.LoggerFactory.getLogger(getClass());
    private final SocketIOServer socketIOServer;

    public OrderLineService(OrderLineRepository orderLineRepository,
                            OrderLineMapper orderLineMapper,
                            OrderItemService orderItemService,
                            OrderRepository orderRepository,
                            TableRepository tableRepository,
                            BranchRepository branchRepository,
                            SocketIOServer socketIOServer) {
        this.orderLineRepository = orderLineRepository;
        this.orderLineMapper = orderLineMapper;
        this.orderItemService = orderItemService;
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.branchRepository = branchRepository;
        this.socketIOServer = socketIOServer;
    }

    public boolean createOrderLine(CreateOrderLineRequest createOrderLineRequest) {
        // check whether this order line is first 
        OrderLine orderLine = new OrderLine();
        Order order = checkOrderExist(createOrderLineRequest.getAreaTableId());
        orderLine.setOrder(order);
        orderLine.setOrderLineStatus(OrderLineStatus.PENDING);
        OrderLine savedOrderLine = orderLineRepository.save(orderLine);
        // save the orderLine first then take it to use in orderItemService.createOrderItem
        savedOrderLine.setOrderItems(orderItemService.createOrderItem(createOrderLineRequest.getOrderItems(), savedOrderLine));
        savedOrderLine.setTotalPrice(getOrderLinePrice(savedOrderLine.getOrderItems()));
        order.setTotalPrice(order.getTotalPrice().add(savedOrderLine.getTotalPrice()));
        order = orderRepository.save(order);
        savedOrderLine = orderLineRepository.save(savedOrderLine);
        boolean createSuccessful = order != null && savedOrderLine != null;
        if (createSuccessful)
        {
            OrderLineDTO orderLineDTO = orderLineMapper.toOrderLineDTO(savedOrderLine);
            AreaTable table = savedOrderLine.getOrder().getAreaTable();
            orderLineDTO.setTableTag(table.getTag());
            orderLineDTO.setAreaName(table.getArea().getName());
            String branchId = table.getArea().getBranch().getBranchId().toString();
            socketIOServer.getRoomOperations(branchId).sendEvent("create_orderLine", orderLineDTO);
        }
        return createSuccessful;
    }

    private BigDecimal getOrderLinePrice(Set<OrderItem> orderItems) {
        BigDecimal orderLinePrice = BigDecimal.ZERO;
        for (OrderItem orderItem : orderItems) {
            if (orderItem.isStatus())
                orderLinePrice = orderLinePrice.add(orderItem.getTotalPrice());
        }
        return orderLinePrice;
    }

    private Order createOrder(UUID areaTableId) {
        Order order = new Order();
        order.setAreaTable(tableRepository.findById(areaTableId).orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND)));
        order.setStatus(OrderStatus.EATING);
        return orderRepository.save(order);
    }

    // find the latest order of this table. If exist then there is currently customer eating at this table. If not then there is no customer at this table 
    // -> we create a new order for the new orderline. 
    // => this orderline will be the first orderline of this order of this table
    // might need to check table status as well
    private Order checkOrderExist(UUID areaTableId) {
        return orderRepository.findTopByAreaTable_AreaTableIdAndStatusOrderByUpdatedAtDesc(areaTableId, OrderStatus.EATING).orElseGet( () -> createOrder(areaTableId));
    }

    // used to return orderItems today
    // this returns orderItems with status false because of soft delete and mapping using mapstruct -> can try to fix this in mapper
    public List<OrderLineDTO> getOrderLinesByStatusAndBranch(UUID branchId, OrderLineStatus orderLineStatus) {
        Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        
        ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.now(zone);
        Instant startOfDay = today.atStartOfDay(zone).toInstant();
        Instant endOfDay = today.plusDays(1).atStartOfDay(zone).toInstant();
        
        // List<OrderLine> orderLines = orderLineRepository.findAllByOrderLineStatusAndOrder_AreaTable_Area_Branch(orderLineStatus, branch);
        List<OrderLine> orderLines = orderLineRepository.findAllTodayByStatusAndBranch(orderLineStatus, branch, startOfDay, endOfDay);
        List<OrderLineDTO> orderLineDTOs = new ArrayList<>();
        for (OrderLine orderLine : orderLines) {
            OrderLineDTO orderLineDTO = orderLineMapper.toOrderLineDTO(orderLine);
            AreaTable table = orderLine.getOrder().getAreaTable();
            orderLineDTO.setTableTag(table.getTag());
            orderLineDTO.setAreaName(table.getArea().getName());
            orderLineDTOs.add(orderLineDTO);
        }
        return orderLineDTOs;
    }

    public UpdateOrderLineStatusResponse setOrderLineStatus(UpdateOrderLineStatusRequest request) {
        OrderLine orderLine = orderLineRepository.findById(request.getOrderLineId()).orElseThrow(() -> new AppException(ErrorCode.ORDERLINE_NOT_EXISTS));
        UpdateOrderLineStatusResponse result = new UpdateOrderLineStatusResponse();
        result.setPreviousStatus(orderLine.getOrderLineStatus());
        if (request.getOrderLineStatus() == OrderLineStatus.CANCELLED) {
            // re-calculate order total price 
            Order order = orderLine.getOrder();
            order.setTotalPrice(order.getTotalPrice().subtract(orderLine.getTotalPrice()));
            orderRepository.save(order);
        }
        orderLine.setOrderLineStatus(request.getOrderLineStatus());
        orderLine = orderLineRepository.save(orderLine);
        result.setSuccessful( orderLine != null);
        result.setNewStatus(orderLine.getOrderLineStatus());
        return result;
    }

    
}
